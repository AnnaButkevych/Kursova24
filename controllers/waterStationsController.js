const { runDBCommand } = require('../db/connection');

module.exports = {
    async getWaterStationsWithProbes(req, res) {
        const query = `
            SELECT 
                ws.WaterStation_id,
                ws.Filtration_date,
                ws.Volume,
                wp.WaterProbe_id,
                wp.ProbaValue,
                p.Name AS ParameterName,
                p.MinValue,
                p.MaxValue
            FROM WaterStation ws
            LEFT JOIN WaterProbe wp ON ws.WaterStation_id = wp.WaterStation_id
            LEFT JOIN Parameters p ON wp.Parameters_id = p.Parameters_id
            ORDER BY ws.WaterStation_id, wp.WaterProbe_id;
        `;

        try {
            const results = await runDBCommand(query);
            // Форматуємо дати у результатах
            const formattedResults = results.map(row => ({
                ...row,
                Filtration_date: new Date(row.Filtration_date).toLocaleDateString('uk-UA'),
            }));
            res.render('waterStations', { results });
        } catch (error) {
            console.error('Error fetching water station data:', error);
            res.status(500).send('Error retrieving data');
        }
    },
};
