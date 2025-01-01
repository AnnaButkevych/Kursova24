const { runDBCommand } = require('../db/connection');

module.exports = {
    async editDeliveryForm(req, res) {
        const { id } = req.params;
        const query = `SELECT * FROM Delivery WHERE Delivery_id = ${id}`;
        const couriersQuery = `SELECT Courier_id, Name, Surname, Courier_status FROM Courier`; 
        try {
            const delivery = await runDBCommand(query);
            const couriers = await runDBCommand(couriersQuery);
            res.render('editDelivery', { delivery: delivery[0], couriers });  
        } catch (error) {
            console.error('Error fetching delivery for edit:', error);
            res.status(500).send('Error fetching delivery');
        }
    },

    async deleteDeliveryForm(req, res) {
        const { id } = req.params;
        const query = `SELECT * FROM Delivery WHERE Delivery_id = ${id}`;
        try {
            const delivery = await runDBCommand(query);
            res.render('deleteDelivery', { delivery: delivery[0] });
        } catch (error) {
            console.error('Error fetching delivery for delete:', error);
            res.status(500).send('Error fetching delivery');
        }
    },

    async addDeliveryForm(req, res) {
        const query = `SELECT Courier_id, Name, Surname FROM Courier`;
        try {
            const couriers = await runDBCommand(query);
            res.render('addDelivery', { couriers });
        } catch (error) {
            console.error('Error fetching couriers for add:', error);
            res.status(500).send('Error fetching couriers');
        }
    },

    async editDelivery(req, res) {
        const { Delivery_id, Delivery_address, Courier_id } = req.body;
        const query = `
            UPDATE Delivery
            SET Delivery_address = '${Delivery_address}', Courier_id = ${Courier_id}
            WHERE Delivery_id = ${Delivery_id}
        `;
        try {
            await runDBCommand(query);
            res.redirect('/tables/deliveries');
        } catch (error) {
            console.error('Error updating delivery:', error);
            res.status(500).send('Error updating delivery');
        }
    },

    async deleteDelivery(req, res) {
        const { Delivery_id } = req.body;
        
        const updateOrdersQuery = `
            UPDATE Orders
            SET Delivery_id = NULL
            WHERE Delivery_id = ${Delivery_id}
        `;
        
        const deleteDeliveryQuery = `
            DELETE FROM Delivery WHERE Delivery_id = ${Delivery_id}
        `;
        
        try {
            await runDBCommand(updateOrdersQuery);
    
            await runDBCommand(deleteDeliveryQuery);
            
            res.redirect('/tables/deliveries');
        } catch (error) {
            console.error('Error deleting delivery:', error);
            res.status(500).send('Error deleting delivery');
        }
    },

    async addDelivery(req, res) {
        const { Delivery_address, Courier_id } = req.body;
        const query = `
            INSERT INTO Delivery (Delivery_address, Courier_id)
            VALUES ('${Delivery_address}', ${Courier_id});
        `;
        try {
            await runDBCommand(query);
            res.redirect('/tables/deliveries');
        } catch (error) {
            console.error('Error adding delivery:', error);
            res.status(500).send('Error adding delivery');
        }
    },
};
