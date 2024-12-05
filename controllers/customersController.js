const { runDBCommand } = require('../db/connection');

module.exports = {
    async getCustomers(req, res) {
        const query = `
            SELECT Customer_id, Name, Surname, Phone_number, Address, Email FROM Customer;
        `;
        try {
            const customers = await runDBCommand(query);
            res.render('customers', { customers });
        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).send('Error retrieving customers');
        }
    }
};
