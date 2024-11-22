const { runDBCommand } = require("../db/connection");
module.exports = {
  getOrders: async (req, res) => {
    try {
        // SQL запит до таблиці Orders
        const query = `
            SELECT Orders_id, 
                   Date, 
                   Status, 
                   Sum, 
                   Payment_type, 
                   Customer_id, 
                   Delivery_id
            FROM Orders`;

        // Виконання запиту
        let data = await runDBCommand(query);

        // Форматування дати для зручності
        data = data.map(order => {
            const formattedOrderDate = new Date(order.Date).toLocaleDateString('uk-UA');
            return {
                ...order,
                formatted_order_date: formattedOrderDate,
            };
        });

        // Виведення даних у консоль (для перевірки)
        console.log(data);

        // Рендер сторінки з отриманими даними
        res.render('order', { orders: data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
  }
};
