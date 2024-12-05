const { runDBCommand } = require('../db/connection');

module.exports = {
    async getDeliveries(req, res) {
        const query = `
            SELECT Delivery_id, Delivery_address, Courier_id FROM Delivery;
        `;
        try {
            const deliveries = await runDBCommand(query);
            res.render('deliveries', { deliveries });
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            res.status(500).send('Error retrieving deliveries');
        }
    }
};
