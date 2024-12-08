const { runDBCommand } = require('../db/connection');

module.exports = {
    async getDashboardData(req, res) {
        const { filterBy, searchQuery, orderStatus } = req.query; // Отримуємо параметри сортування та пошуку

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

        // Додавання пошуку по замовленням (статус, ім'я або прізвище клієнта)
        if (searchQuery) {
            query += ` WHERE o.Status LIKE '%${searchQuery}%' OR c.Name LIKE '%${searchQuery}%' OR c.Surname LIKE '%${searchQuery}%'`;
        }

        if (filterBy) {
            query += ` AND o.Status = '${filterBy}'`;  // Фільтрація за статусом
        }

        // Додавання сортування
        if (filterBy === 'date-asc') {
            query += ' ORDER BY o.Date ASC';  // Дата (від першої до останньої)
        } else if (filterBy === 'date-desc') {
            query += ' ORDER BY o.Date DESC'; // Дата (від останньої до першої)
        } else if (filterBy === 'sum-asc') {
            query += ' ORDER BY o.Sum ASC';   // Сума (від найменшої до найбільшої)
        } else if (filterBy === 'sum-desc') {
            query += ' ORDER BY o.Sum DESC';  // Сума (від найбільшої до найменшої)
        } else {
            query += ' ORDER BY o.Date DESC'; // За замовчуванням сортування за датою (від останньої до першої)
        }

        try {
            const ordersDetails = await runDBCommand(query);

            res.status(200).render('adminDashboard', {
                success: true,
                orders: ordersDetails,
                filterBy: filterBy || '', // Якщо немає filterBy, за замовчуванням 'date-desc'
                searchQuery: searchQuery || '', // Якщо немає searchQuery, використовуємо порожній рядок
                orderStatus: orderStatus || '' // Якщо немає orderStatus, за замовчуванням порожній рядок
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
