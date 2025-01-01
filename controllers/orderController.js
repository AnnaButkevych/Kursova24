const { runDBCommand } = require("../db/connection");
const mysql = require("mysql2");

module.exports = {
  getOrders: async (req, res) => {
    try {
      const session_id = req.session.sessionId;

      const ordersQuery = `
        SELECT Orders_id, 
               Date, 
               Status, 
               Sum, 
               Payment_type_id, 
               Customer_id, 
               Delivery_id
        FROM Orders`;

      const busketQuery = `
        SELECT 
          b.Busket_id AS id,
          p.Product_name AS product_name,
          pc.Price_per_unit AS product_price,
          b.Quantity AS quantity,
          p.Image_name,
          (pc.Price_per_unit * b.Quantity) AS total_price,
          pw.Product_id
        FROM 
          Busket b
        LEFT JOIN Price_change pc ON b.Price_change_id = pc.Price_change_id
        JOIN ProductsOnWarehouse pw ON pc.ProductsOnWarehouse_id = pw.ProductsOnWarehouse_id
        JOIN Product p ON pw.Product_id = p.Product_id
        WHERE 
          b.Session_id = '${session_id}';
      `;

      const busketItems = await runDBCommand(busketQuery);

      if (busketItems.length === 0) {
        return res.render("order", {
          orders: [],
          products: [],
          busketItems: [],
          title: "Замовлення - AcvaDel",
        });
      }

      const productQuantitiesQuery = `
        SELECT 
          pw.Product_id,
          pw.Quantity
        FROM 
          ProductsOnWarehouse pw
        WHERE 
          pw.Product_id IN (${busketItems
            .map((item) => item.Product_id)
            .join(",")});
      `;

      const productQuantities = await runDBCommand(productQuantitiesQuery);

      const busketItemsWithMaxQuantity = busketItems.map((item) => {
        const quantity =
          productQuantities.find((pq) => pq.Product_id === item.Product_id)
            ?.Quantity || 0;
        return {
          ...item,
          max_quantity: quantity,
        };
      });

      const productsQuery = `
        SELECT Product_id AS id, 
               Product_name AS name, 
               Storage_unit AS unit, 
               Details AS description
        FROM Product`;

      const orders = await runDBCommand(ordersQuery);
      const products = await runDBCommand(productsQuery);

      const formattedOrders = orders.map((order) => ({
        ...order,
        formatted_order_date: new Date(order.Date).toLocaleDateString("uk-UA"),
      }));

      res.render("order", {
        orders: formattedOrders,
        products: products,
        busketItems: busketItemsWithMaxQuantity,
        title: "Замовлення - AcvaDel",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  getAddOrderPage: async (req, res) => {
    try {
      const customersQuery = `SELECT customer_id, name, surname FROM Customer`;
      const deliveriesQuery = `SELECT delivery_id, delivery_address FROM Delivery`;

      const customers = await runDBCommand(customersQuery);
      const deliveries = await runDBCommand(deliveriesQuery);

      res.render("/order", { customers, deliveries }); 
    } catch (err) {
      console.error("Error loading add order page:", err);
      res.status(500).send("Сталася помилка при завантаженні сторінки.");
    }
  },

  addOrder: async (req, res) => {
    try {
      const session_id = req.session.sessionId;
      const {
        customerName,
        customerSurname,
        customerPhone,
        paymentType,
        customerAddress,
        customerEmail,
      } = req.body;

      const getProductSumQuery = `
        SELECT SUM(b.quantity * COALESCE(pc.price_per_unit)) OVER (PARTITION BY b.Session_id) AS total_sum 
        FROM Busket b
        JOIN Price_change pc ON b.Price_change_id = pc.Price_change_id
        WHERE b.Session_id = '${session_id}'
      `;

      const total_sum = (await runDBCommand(getProductSumQuery))[0].total_sum;

      if (total_sum < 0) {
        return res.status(400).send("Сума замовлення не може бути від'ємною.");
      }

      const customerQuery = `
        INSERT INTO Customer (name, surname, phone_number, address, email)
        VALUES ('${customerName}', '${customerSurname}', '${customerPhone}', '${customerAddress}', '${customerEmail}')
      `;

      const customerResult = await runDBCommand(customerQuery);

      const deliveryQuery = `
        INSERT INTO Delivery (delivery_address, courier_id)
        VALUES ('${customerAddress}', '1')
      `;

      const deliveryResult = await runDBCommand(deliveryQuery);

      const customerId = parseInt(customerResult.insertId, 10);
      const deliveryId = parseInt(deliveryResult.insertId, 10);

      if (isNaN(customerId) || isNaN(deliveryId)) {
        throw new Error(
          "Invalid customerResult or deliveryResult. They must be valid integers."
        );
      }

      const setBusketIdQuery = `
        SELECT busket_id
        FROM Busket
        WHERE Session_id = '${session_id}';
      `;
      const setBusketIdQueryResult = await runDBCommand(setBusketIdQuery);

      const insertOrderQuery = `
        INSERT INTO Orders (date, status, sum, Payment_type_id, customer_id, delivery_id, busket_id)
        VALUES (NOW(), 'Pending', ${total_sum}, '${paymentType}', '${customerId}', '${deliveryId}', '${setBusketIdQueryResult[0].busket_id}');
      `;

      await runDBCommand(insertOrderQuery);

      const basketItemsQuery = `
        SELECT pw.Product_id, b.Quantity
        FROM Busket b
        JOIN Price_change pc ON b.Price_change_id = pc.Price_change_id
        JOIN ProductsOnWarehouse pw ON pc.ProductsOnWarehouse_id = pw.ProductsOnWarehouse_id
        WHERE b.Session_id = '${session_id}'
      `;

      const basketItems = await runDBCommand(basketItemsQuery);

      for (const item of basketItems) {
        const updateStockQuery = `
          UPDATE ProductsOnWarehouse
          SET Quantity = Quantity - ${item.Quantity}
          WHERE Product_id = ${item.Product_id}
        `;
        await runDBCommand(updateStockQuery);
      }

      res.status(200).json({ message: "Order added successfully" });
    } catch (err) {
      console.error("Error adding order:", err);
      res.status(500).send("Сталася помилка при додаванні замовлення.");
    }
  },

  deleteBusketItem: async (req, res) => {
    try {
      const busketId = req.params.id; 

      const checkOrdersQuery = `SELECT * FROM Orders WHERE Busket_id = ?`;
      const orders = await runDBCommand(checkOrdersQuery, [busketId]);

      if (orders.length > 0) {
        const deleteOrdersQuery = `DELETE FROM Orders WHERE Busket_id = ?`;
        await runDBCommand(deleteOrdersQuery, [busketId]);
      }

      const deleteBusketQuery = `DELETE FROM Busket WHERE Busket_id = ?`;
      await runDBCommand(deleteBusketQuery, [busketId]);

      res.status(200).json({ message: "Busket item deleted successfully" });
    } catch (err) {
      console.error("Error deleting busket item:", err);
      res
        .status(500)
        .json({ message: "Error deleting busket item", error: err.message });
    }
  },
};
