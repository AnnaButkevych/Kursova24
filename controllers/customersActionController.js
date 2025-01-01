const { runDBCommand } = require('../db/connection');

module.exports = {
    async getEditCustomerForm(req, res) {
        const customerId = req.params.id;
        try {
            const query = `SELECT * FROM Customer WHERE Customer_id = ${customerId}`;
            const customer = await runDBCommand(query);

            if (customer.length > 0) {
                res.render('editCustomer', { customer: customer[0] });
            } else {
                res.redirect('/tables/customers');
            }
        } catch (err) {
            console.error(err);
            res.redirect('/tables/customers');
        }
    },

    async updateCustomer(req, res) {
        const customerId = req.params.id;
        const { name, surname, phone_number, address, email } = req.body;

        try {
            const query = `
                UPDATE Customer 
                SET Name = '${name}', 
                    Surname = '${surname}', 
                    Phone_number = '${phone_number}', 
                    Address = '${address}', 
                    Email = '${email}' 
                WHERE Customer_id = ${customerId}`;
            await runDBCommand(query);
            res.redirect('/tables/customers');
        } catch (err) {
            console.error(err);
            res.redirect(`/customers/edit/${customerId}`);
        }
    },

    async deleteCustomer(req, res) {
        const customerId = req.params.id;
    
        try {
            const deleteOrdersQuery = `
                DELETE FROM Orders
                WHERE Customer_id = ${customerId}
            `;
            await runDBCommand(deleteOrdersQuery);
    
            const deleteCustomerQuery = `
                DELETE FROM Customer
                WHERE Customer_id = ${customerId}
            `;
            await runDBCommand(deleteCustomerQuery);
    
            res.redirect('/tables/customers');
        } catch (err) {
            console.error(err);
            res.redirect('/tables/customers');
        }
    }
    
};
console.log(module.exports);
