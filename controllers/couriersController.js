const { runDBCommand } = require('../db/connection');

module.exports = {
    async getCouriers(req, res) {
        const query = `
            SELECT 
                Courier_id, 
                Name, 
                Surname, 
                Phone_number, 
                Courier_status 
            FROM Courier;
        `;
        try {
            const couriers = await runDBCommand(query); 
            res.render('couriers', { couriers }); 
        } catch (error) {
            console.error('Error fetching couriers:', error);
            res.status(500).send('Error retrieving couriers');
        }
    }
};
