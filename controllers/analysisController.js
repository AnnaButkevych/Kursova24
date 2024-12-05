const { runDBCommand } = require('../db/connection');

module.exports = {
    async getAnalysis(req, res) {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).send('Необхідно вказати діапазон дат');
        }

        // Запит для аналізу кількості замовлень і загальної суми
        const query = `
            SELECT COUNT(*) AS OrderCount, SUM(Sum) AS TotalAmount
            FROM Orders
            WHERE Date BETWEEN '${startDate}' AND '${endDate}'
        `;
        
        try {
            const analysis = await runDBCommand(query); // Виконання запиту
            res.render('analysis', {
                analysis,
                startDate,
                endDate
            });
        } catch (error) {
            console.error('Error fetching analysis:', error);
            res.status(500).send('Error retrieving analysis');
        }
    }
};
