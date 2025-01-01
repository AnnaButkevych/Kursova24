const { runDBCommand } = require('../db/connection');

module.exports = {
    async getDashboardData(req, res) {
        const { filterBy, searchQuery, orderStatus } = req.query; 
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

        const conditions = [];

        if (searchQuery) {
            conditions.push(`(o.Status LIKE '%${searchQuery}%' OR c.Name LIKE '%${searchQuery}%' OR c.Surname LIKE '%${searchQuery}%')`);
        }

        if (orderStatus) {
            if (Array.isArray(orderStatus)) {
                const statuses = orderStatus.map(status => `'${status}'`).join(', ');
                conditions.push(`o.Status IN (${statuses})`);
            } else {
                conditions.push(`o.Status = '${orderStatus}'`);
            }
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        if (filterBy === 'date-asc') {
            query += ' ORDER BY o.Date ASC';
        } else if (filterBy === 'date-desc') {
            query += ' ORDER BY o.Date DESC';
        } else if (filterBy === 'sum-asc') {
            query += ' ORDER BY o.Sum ASC';
        } else if (filterBy === 'sum-desc') {
            query += ' ORDER BY o.Sum DESC';
        } else {
            query += ' ORDER BY o.Date DESC';
        }

        try {
            const ordersDetails = await runDBCommand(query);

            res.status(200).render('adminDashboard', {
                success: true,
                orders: ordersDetails,
                filterBy: filterBy || '', 
                searchQuery: searchQuery || '', 
                orderStatus: orderStatus || ''
            });
        } catch (error) {
            console.error('Error in getDashboardData:', error);
            res.status(500).render('adminDashboard', {
                success: false,
                message: 'Error retrieving order data',
            });
        }
    },
    async getEditOrderForm(req, res) {
        const orderId = req.params.id;

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
