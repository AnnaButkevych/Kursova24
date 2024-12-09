const { runDBCommand } = require('../db/connection');

module.exports = {
    async getDashboardData(req, res) {
        const { filterBy, searchQuery, orderStatus } = req.query; // Отримуємо параметри

        // Базовий SQL-запит
        let query = `
            SELECT 
                o.Orders_id, 
                o.Date, 
                o.Status, 
                o.Sum, 
                c.Name AS CustomerName, 
                c.Surname AS CustomerSurname, 
                pt.Type AS PaymentType
            FROM Orders o
            JOIN Customer c ON o.Customer_id = c.Customer_id
            JOIN Payment_type pt ON o.Payment_type_id = pt.Payment_type_id
        `;

        // Масив для динамічних умов WHERE
        const conditions = [];

        // Додавання пошуку
        if (searchQuery) {
            conditions.push(`(o.Status LIKE '%${searchQuery}%' OR c.Name LIKE '%${searchQuery}%' OR c.Surname LIKE '%${searchQuery}%')`);
        }

        // Додавання фільтрації за статусом
        if (orderStatus) {
            conditions.push(`o.Status = '${orderStatus}'`);
        }

        // Додавання умов WHERE (якщо є)
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Додавання сортування
        if (filterBy === 'date-asc') {
            query += ' ORDER BY o.Date ASC';
        } else if (filterBy === 'date-desc') {
            query += ' ORDER BY o.Date DESC';
        } else if (filterBy === 'sum-asc') {
            query += ' ORDER BY o.Sum ASC';
        } else if (filterBy === 'sum-desc') {
            query += ' ORDER BY o.Sum DESC';
        } else {
            query += ' ORDER BY o.Date DESC'; // Сортування за замовчуванням
        }

        try {
            const ordersDetails = await runDBCommand(query);

            res.status(200).render('adminDashboard', {
                success: true,
                orders: ordersDetails,
                filterBy: filterBy || '', // Передаємо активний фільтр
                searchQuery: searchQuery || '', // Передаємо пошуковий запит
                orderStatus: orderStatus || '' // Передаємо активний статус
            });
        } catch (error) {
            console.error('Error in getDashboardData:', error);
            res.status(500).render('adminDashboard', {
                success: false,
                message: 'Error retrieving order data',
            });
        }
    },
};
