const { runDBCommand } = require('../db/connection');

module.exports = {
    // Відкриваємо форму редагування доставки
    async editDeliveryForm(req, res) {
        const { id } = req.params;
        const query = `SELECT * FROM Delivery WHERE Delivery_id = ${id}`;
        const couriersQuery = `SELECT Courier_id, Name, Surname, Courier_status FROM Courier`;  // Додаємо запит для кур'єрів
        try {
            const delivery = await runDBCommand(query);
            const couriers = await runDBCommand(couriersQuery); // Отримуємо список кур'єрів
            res.render('editDelivery', { delivery: delivery[0], couriers });  // Передаємо кур'єрів у шаблон
        } catch (error) {
            console.error('Error fetching delivery for edit:', error);
            res.status(500).send('Error fetching delivery');
        }
    },

    // Відкриваємо форму видалення доставки
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

    // Відкриваємо форму додавання доставки
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

    // Обробка редагування доставки
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

    // Контролер для видалення доставки
    async deleteDelivery(req, res) {
        const { Delivery_id } = req.body;
        
        // Оновлюємо записи в таблиці Orders, щоб вони не посилались на цю доставку
        const updateOrdersQuery = `
            UPDATE Orders
            SET Delivery_id = NULL
            WHERE Delivery_id = ${Delivery_id}
        `;
        
        // Потім видаляємо доставку
        const deleteDeliveryQuery = `
            DELETE FROM Delivery WHERE Delivery_id = ${Delivery_id}
        `;
        
        try {
            // Спочатку оновлюємо записи в таблиці Orders
            await runDBCommand(updateOrdersQuery);
    
            // Потім видаляємо доставку
            await runDBCommand(deleteDeliveryQuery);
            
            res.redirect('/tables/deliveries');
        } catch (error) {
            console.error('Error deleting delivery:', error);
            res.status(500).send('Error deleting delivery');
        }
    },

    // Обробка додавання нової доставки
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
