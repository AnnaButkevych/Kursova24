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
        
        const query = `SELECT * FROM Busket WHERE session_id = ${mysql.escape(session_id)}`;
        const busketItems = await runDBCommand(query);
        
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
      const { id } = req.params;
      const { Date, Status, Sum, Payment_type, Customer_id, Delivery_id } = req.body;

      const query = `
        UPDATE Orders
        SET Date = ?, 
            Status = ?, 
            Sum = ?, 
            Payment_type = ?, 
            Customer_id = ?, 
            Delivery_id = ?
        WHERE Orders_id = ?`;

      await runDBCommand(query, [Date, Status, Sum, Payment_type, Customer_id, Delivery_id, id]);
      res.status(200).send("Order updated successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating order");
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