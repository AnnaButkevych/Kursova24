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

            const formattedResults = results.map(row => ({
                ...row,
                Filtration_date: new Date(row.Filtration_date).toLocaleDateString('uk-UA'),
            }));

            const filtrationDates = results.map(row => new Date(row.Filtration_date));
            const minDate = new Date(Math.min(...filtrationDates)).toLocaleDateString('uk-UA');
            const maxDate = new Date(Math.max(...filtrationDates)).toLocaleDateString('uk-UA');

            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            if (fs.existsSync(fontPath)) {
                doc.registerFont('DejaVuSans', fontPath);
                doc.font('DejaVuSans');
            } else {
                console.error('Font file not found at:', fontPath);
                doc.font('Helvetica');
            }

            doc.fontSize(18).text('Звіт по водних станціях та пробах води', { align: 'center' });
            doc.moveDown(1);

            doc.fontSize(12).text(`Період: з ${minDate} по ${maxDate}`, { align: 'center' });
            doc.moveDown(2);

            const tableHeader = [
                'Дата фільтрації',
                'Об’єм',
                'Параметр',
                'Значення проби',
                'Мін. значення',
                'Макс. значення'
            ];

            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const columnWidths = [120, 60, 100, 100, 100, 100]; 
            const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

            if (totalWidth > pageWidth) {
                const scaleFactor = pageWidth / totalWidth;
                columnWidths.forEach((width, index) => {
                    columnWidths[index] = width * scaleFactor;
                });
            }

            const tableTop = doc.y; 
            const tableLeft = doc.page.margins.left; 

            function drawTable(doc, data, columnWidths, top, left) {
                let currentY = top;
                let currentX = left;

                data.forEach((row, rowIndex) => {
                    row.forEach((cell, cellIndex) => {
                        if (rowIndex === 0) {
                            doc.font('DejaVuSans').fontSize(12).text(cell, currentX, currentY, { width: columnWidths[cellIndex], align: 'center' });
                        } else {
                            doc.font('DejaVuSans').fontSize(10).text(cell, currentX, currentY, { width: columnWidths[cellIndex], align: 'center' });
                        }
                        currentX += columnWidths[cellIndex];
                    });
                    currentY += 30; 
                    currentX = left;
                });

                doc.lineWidth(0.5);
                for (let i = 0; i <= data.length; i++) {
                    doc.moveTo(left, top + i * 30) 
                        .lineTo(left + columnWidths.reduce((a, b) => a + b, 0), top + i * 30)
                        .stroke();
                }

                for (let i = 0; i <= columnWidths.length; i++) {
                    doc.moveTo(left + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), top)
                        .lineTo(left + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), top + data.length * 30) // Змінюємо на 30
                        .stroke();
                }
            }

            drawTable(doc, [tableHeader], columnWidths, tableTop, tableLeft);

            const tableData = formattedResults.map(row => [
                row.Filtration_date,
                row.Volume,
                row.ParameterName || 'Немає',
                row.ProbaValue || 'Немає',
                row.MinValue || 'Немає',
                row.MaxValue || 'Немає'
            ]);

            drawTable(doc, tableData, columnWidths, tableTop + 30, tableLeft);

            doc.moveDown(2);
            const currentDate = new Date().toLocaleDateString('uk-UA');
            doc.fontSize(10).text(`Дата створення звіту: ${currentDate}`, { align: 'right' });

            res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="water_station_report.pdf"');

            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error fetching water station data:', error);
            res.status(500).send('Error retrieving data');
        }
    },
};
