const { runDBCommand } = require('../db/connection');

module.exports = {
    async getAnalysis(req, res) {
        const { startDate, endDate } = req.query;

        let analysis = null;

        // Якщо дати передані, виконуємо запит для аналізу
        if (startDate && endDate) {
            const query = `
                SELECT COUNT(*) AS OrderCount, SUM(Sum) AS TotalAmount
                FROM Orders
                WHERE Date BETWEEN '${startDate}' AND '${endDate}'
            `;
        
            try {
                analysis = await runDBCommand(query); // Виконання запиту
                if (analysis[0]) {
                    // Перевіряємо, чи є TotalAmount
                    analysis[0].TotalAmount = parseFloat(analysis[0].TotalAmount) || 0; // Перетворюємо на число
                }
            } catch (error) {
                console.error('Error fetching analysis:', error);
                return res.status(500).send('Error retrieving analysis');
            }
        }

        res.render('analysis', {
            analysis,
            startDate,
            endDate
        });
    }
};
