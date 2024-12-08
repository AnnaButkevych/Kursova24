const { runDBCommand } = require('../db/connection');

module.exports = {
    async getStatistics(req, res) {
        // Запит для кількості замовлень по місяцях
        const ordersPerMonthQuery = `
            SELECT YEAR(Date) AS Year, MONTH(Date) AS Month, COUNT(*) AS OrderCount
            FROM Orders
            GROUP BY YEAR(Date), MONTH(Date)
            ORDER BY Year DESC, Month DESC;
        `;

        // Запит для кількості замовлень за кожним кур'єром
        const ordersByCourierQuery = `
            SELECT c.Name AS CourierName, c.Surname AS CourierSurname, COUNT(o.Orders_id) AS OrderCount
            FROM Orders o
            JOIN Delivery d ON o.Delivery_id = d.Delivery_id
            JOIN Courier c ON d.Courier_id = c.Courier_id
            GROUP BY c.Courier_id
            ORDER BY OrderCount DESC; 
        `;

        // Запит для популярності способів оплати
        const paymentMethodPopularityQuery = `
            SELECT pt.Type AS PaymentType, COUNT(o.Orders_id) AS OrderCount
            FROM Orders o
            JOIN Payment_type pt ON o.Payment_type_id = pt.Payment_type_id
            GROUP BY pt.Type
            ORDER BY OrderCount DESC;
        `;

        try {
            const ordersPerMonth = await runDBCommand(ordersPerMonthQuery);
            const ordersByCourier = await runDBCommand(ordersByCourierQuery);
            const paymentMethodPopularity = await runDBCommand(paymentMethodPopularityQuery);

            res.render('statistics', { 
                ordersPerMonth, 
                ordersByCourier, 
                paymentMethodPopularity 
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).send('Error retrieving statistics');
        }
    }
};
