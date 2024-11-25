const { runDBCommand } = require("../db/connection");
const mysql = require('mysql2');

module.exports = {
  // Отримання всіх замовлень з можливістю фільтрації, пошуку та сортування
  getOrders: async (req, res) => {
        try {
        const session_id = req.session.sessionId;
        // SQL-запит для отримання замовлень
        const ordersQuery = `
          SELECT Orders_id, 
                 Date, 
                 Status, 
                 Sum, 
                 Payment_type_id, 
                 Customer_id, 
                 Delivery_id
          FROM Orders`;
        
            // Query to fetch basket items
        const busketQuery = `SELECT 
            b.Busket_id AS id,
            p.Product_name AS product_name,
            pc.Price_per_unit AS product_price,
            b.Quantity AS quantity,
            (pc.Price_per_unit * b.Quantity) AS total_price
        FROM 
            Busket b 
        JOIN Product p ON b.Order_Water_id = p.Product_id
        LEFT JOIN Price_change pc ON p.Product_id = pc.ProductsOnWarehouse_id
        WHERE 
            b.Session_id = '${session_id}' 
            AND pc.Change_date = (
            SELECT MAX(Change_date)
            FROM Price_change
            WHERE ProductsOnWarehouse_id = pc.ProductsOnWarehouse_id
            );`;
        const busketItems = await runDBCommand(busketQuery);
            console.log(busketItems)
            
        // SQL-запит для отримання продуктів
        const productsQuery = `
          SELECT Product_id AS id, 
                 Product_name AS name, 
                 Storage_unit AS unit, 
                 Details AS description
          FROM Product`;
  
        // Виконання SQL-запитів
        const orders = await runDBCommand(ordersQuery);
        const products = await runDBCommand(productsQuery);
  
        // Форматування замовлень
        const formattedOrders = orders.map(order => ({
          ...order,
          formatted_order_date: new Date(order.Date).toLocaleDateString('uk-UA'),
        }));
  
        // Передача даних у шаблон
        res.render('order', {
          orders: formattedOrders,
            products: products,
            busketItems: busketItems,
          title: 'Замовлення - Аквасвіт',
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
  },

  // Додавання нового замовлення
  addOrder: async (req, res) => {
    try {
      const { Date, Status, Sum, Payment_type, Customer_id, Delivery_id } = req.body;

      const query = `
        INSERT INTO Orders (Date, Status, Sum, Payment_type, Customer_id, Delivery_id)
        VALUES (?, ?, ?, ?, ?, ?)`;

      await runDBCommand(query, [Date, Status, Sum, Payment_type, Customer_id, Delivery_id]);
      res.status(200).send("Order added successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding order");
    }
    },
  
// Редагування замовлення
    editOrder: async (req, res) => { 
    try {
      const { Date, Status, Sum, Payment_type, Customer_id, Delivery_id } = req.body;
  
      // Спочатку додаємо нове замовлення
      const query = `
        INSERT INTO Orders (Date, Status, Sum, Payment_type, Customer_id, Delivery_id)
        VALUES (?, ?, ?, ?, ?, ?)`;
  
      const result = await runDBCommand(query, [Date, Status, Sum, Payment_type, Customer_id, Delivery_id]);
      const newOrderId = result.insertId; // отримуємо ID нового замовлення
  
      // Далі переносимо продукти з кошика в замовлення
      const busketQuery = `SELECT * FROM Busket WHERE session_id = ${mysql.escape(req.session.sessionId)}`;
      const busketItems = await runDBCommand(busketQuery);
  
      // Додаємо кожен продукт з кошика в таблицю Order_Products
      for (const item of busketItems) {
        const orderProductQuery = `
          INSERT INTO Order_Products (Order_id, Product_id, Quantity)
          VALUES (?, ?, ?)`;
        await runDBCommand(orderProductQuery, [newOrderId, item.Product_id, item.Quantity]);
      }
  
      // Тепер очищуємо кошик після додавання замовлення
      const deleteBusketQuery = `DELETE FROM Busket WHERE session_id = ${mysql.escape(req.session.sessionId)}`;
      await runDBCommand(deleteBusketQuery);
  
      res.status(200).send("Order added successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding order");
    }
  },
  // Видалення замовлення
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        DELETE FROM Orders
        WHERE Orders_id = ?`;

      await runDBCommand(query, [id]);
      res.status(200).send("Order deleted successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting order");
    }
  },

  // Отримання статистики по замовленням
  getOrderStatistics: async (req, res) => {
    try {
      const query = `
        SELECT Status, COUNT(*) AS Count, SUM(Sum) AS TotalSum
        FROM Orders
        GROUP BY Status`;

      const data = await runDBCommand(query);

      res.render('statistics', { statistics: data });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching statistics");
    }
  },

  // Генерація звітів
  generateReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const query = `
        SELECT Orders_id, Date, Status, Sum
        FROM Orders
        WHERE Date BETWEEN ? AND ?`;

      const data = await runDBCommand(query, [startDate, endDate]);

      res.render('report', { report: data });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating report");
    }
  },
};
