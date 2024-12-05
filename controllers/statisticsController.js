const { runDBCommand } = require('../db/connection');

module.exports = {
    async getStatistics(req, res) {
        // статистики: кількість замовлень по місяцях
        const query = `
            SELECT YEAR(Date) AS Year, MONTH(Date) AS Month, COUNT(*) AS OrderCount
            FROM Orders
            GROUP BY YEAR(Date), MONTH(Date)
            ORDER BY Year DESC, Month DESC;
        `;
        try {
            const statistics = await runDBCommand(query);
            res.render('statistics', { statistics });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).send('Error retrieving statistics');
        }
    }
};
