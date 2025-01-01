const { runDBCommand } = require('../db/connection');

module.exports = {
    async addCourierForm(req, res) {
        res.render('addCourier');
    },

    async addCourier(req, res) {
        const { Name, Surname, Phone_number, Courier_status } = req.body;
        const query = `
            INSERT INTO Courier (Name, Surname, Phone_number, Courier_status)
            VALUES ('${Name}', '${Surname}', '${Phone_number}', '${Courier_status}');
        `;
        try {
            await runDBCommand(query);
            res.redirect('/tables/couriers');
        } catch (error) {
            console.error('Error adding courier:', error);
            res.status(500).send('Error adding courier');
        }
    },

    async editCourierForm(req, res) {
        const { id } = req.params;
        const query = `SELECT * FROM Courier WHERE Courier_id = ${id}`;
        try {
            const courier = await runDBCommand(query);
            res.render('editCourier', { courier: courier[0] });
        } catch (error) {
            console.error('Error fetching courier for edit:', error);
            res.status(500).send('Error fetching courier');
        }
    },

    async editCourier(req, res) {
        const { Courier_id, Name, Surname, Phone_number, Courier_status } = req.body;
        const query = `
            UPDATE Courier
            SET Name = '${Name}', Surname = '${Surname}', Phone_number = '${Phone_number}', Courier_status = '${Courier_status}'
            WHERE Courier_id = ${Courier_id};
        `;
        try {
            await runDBCommand(query);
            res.redirect('/tables/couriers');
        } catch (error) {
            console.error('Error editing courier:', error);
            res.status(500).send('Error editing courier');
        }
    },

    async deleteCourierForm(req, res) {
        const { id } = req.params;
        const query = `SELECT * FROM Courier WHERE Courier_id = ${id}`;
        try {
            const courier = await runDBCommand(query);
            res.render('deleteCourier', { courier: courier[0] });
        } catch (error) {
            console.error('Error fetching courier for delete:', error);
            res.status(500).send('Error fetching courier');
        }
    },

async deleteCourier(req, res) {
    const { Courier_id } = req.params;

    const deleteQuery = `
        DELETE FROM Courier
        WHERE Courier_id = ${Courier_id}
    `;

    try {
        await runDBCommand(deleteQuery); 
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting courier:', error);
        res.status(500).json({ success: false, message: 'Error deleting courier' }); // Повертаємо помилку
    }
}
};
