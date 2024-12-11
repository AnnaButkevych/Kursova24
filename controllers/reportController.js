const PDFDocument = require('pdfkit');
const { runDBCommand } = require('../db/connection');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf'); 

module.exports = {
    async generateWaterStationReport(req, res) {
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

            // Format dates in results
            const formattedResults = results.map(row => ({
                ...row,
                Filtration_date: new Date(row.Filtration_date).toLocaleDateString('uk-UA'),
            }));

            // Create a new PDF document
            const doc = new PDFDocument();

            // Check if font exists and set the font
            if (fs.existsSync(fontPath)) {
                doc.registerFont('DejaVuSans', fontPath);
                doc.font('DejaVuSans');
            } else {
                console.error('Font file not found at:', fontPath);
                // Set a fallback font if DejaVuSans is missing
                doc.font('Helvetica');
            }

            // Set the report title
            doc.fontSize(18).text('Звіт по водних станціях та пробах води', { align: 'center' });
            doc.moveDown(2); // New line

            // Add table header
            doc.fontSize(12).text('Дата фільтрації | Об’єм | Параметр | Значення проби | Мін. значення | Макс. значення', {
                align: 'center',
                underline: true
            });
            doc.moveDown(1); // Move to table

            // Add table data
            formattedResults.forEach(row => {
                doc.text(`${row.Filtration_date} | ${row.Volume} | ${row.ParameterName || 'Немає'} | ${row.ProbaValue || 'Немає'} | ${row.MinValue || 'Немає'} | ${row.MaxValue || 'Немає'}`);
            });

            // Add report creation date
            doc.moveDown(2);
            const currentDate = new Date().toLocaleDateString('uk-UA');
            doc.fontSize(10).text(`Дата створення звіту: ${currentDate}`, { align: 'right' });

            // Set the headers for the PDF response
            res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="water_station_report.pdf"');

            // Output PDF to response
            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error fetching water station data:', error);
            res.status(500).send('Error retrieving data');
        }
    },
};
