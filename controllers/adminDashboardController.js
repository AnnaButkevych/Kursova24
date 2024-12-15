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
            // Перевіряємо, чи orderStatus є масивом
            if (Array.isArray(orderStatus)) {
                // Якщо це масив, створюємо умову IN
                const statuses = orderStatus.map(status => `'${status}'`).join(', ');
                conditions.push(`o.Status IN (${statuses})`);
            } else {
                // Якщо це одне значення, додаємо як звичайну умову
                conditions.push(`o.Status = '${orderStatus}'`);
            }
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
    // Отримання форми редагування замовлення
    async getEditOrderForm(req, res) {
        const orderId = req.params.id;

        // Масиви з можливими статусами та типами оплати
        const statusOptions = ['очікує оплати', 'виконане', 'скасоване'];
        const paymentTypeOptions = ['готівка', 'картка', 'PayPal'];

        try {
            const query = `
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
                WHERE o.Orders_id = ${orderId}
            `;
            const order = await runDBCommand(query);

            if (order.length > 0) {
                res.render('editOrder', {
                    order: order[0],
                    statusOptions,
                    paymentTypeOptions
                });
            } else {
                res.redirect('/admin/dashboard');
            }
        } catch (err) {
            console.error(err);
            res.redirect('/admin/dashboard');
        }
    },

    // Оновлення замовлення
    async updateOrder(req, res) {
        const orderId = req.params.id;
        const { Date, Status, Sum, PaymentType } = req.body;

        try {
            const query = `
                UPDATE Orders 
                SET Date = '${Date}', 
                    Status = '${Status}', 
                    Sum = '${Sum}', 
                    Payment_type_id = (SELECT Payment_type_id FROM Payment_type WHERE Type = '${PaymentType}')
                WHERE Orders_id = ${orderId}
            `;
            await runDBCommand(query);
            res.redirect('/admin/dashboard');
        } catch (err) {
            console.error(err);
            res.redirect(`/admin/edit-order/${orderId}`);
        }
    },

    // Видалення замовлення
    async deleteOrder(req, res) {
        const orderId = req.params.id;
        try {
            const query = `DELETE FROM Orders WHERE Orders_id = ${orderId}`;
            await runDBCommand(query);
            res.redirect('/admin/dashboard');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/dashboard');
        }
    }
};
