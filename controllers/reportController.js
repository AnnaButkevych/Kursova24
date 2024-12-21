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

            // Find the date range
            const filtrationDates = results.map(row => new Date(row.Filtration_date));
            const minDate = new Date(Math.min(...filtrationDates)).toLocaleDateString('uk-UA');
            const maxDate = new Date(Math.max(...filtrationDates)).toLocaleDateString('uk-UA');

            // Create a new PDF document
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

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
            doc.moveDown(1);

            // Add the date range
            doc.fontSize(12).text(`Період: з ${minDate} по ${maxDate}`, { align: 'center' });
            doc.moveDown(2);

            // Add table header
            const tableHeader = [
                'Дата фільтрації',
                'Об’єм',
                'Параметр',
                'Значення проби',
                'Мін. значення',
                'Макс. значення'
            ];

            // Calculate column widths based on page width
            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const columnWidths = [120, 60, 100, 100, 100, 100]; // Ширина кожної колонки
            const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

            // Normalize column widths if they exceed page width
            if (totalWidth > pageWidth) {
                const scaleFactor = pageWidth / totalWidth;
                columnWidths.forEach((width, index) => {
                    columnWidths[index] = width * scaleFactor;
                });
            }

            const tableTop = doc.y; // Початкова позиція таблиці
            const tableLeft = doc.page.margins.left; // Початкова позиція таблиці зліва

            // Функція для малювання таблиці
            function drawTable(doc, data, columnWidths, top, left) {
                let currentY = top;
                let currentX = left;

                data.forEach((row, rowIndex) => {
                    row.forEach((cell, cellIndex) => {
                        // Використовуємо жирний шрифт для заголовків
                        if (rowIndex === 0) {
                            doc.font('DejaVuSans').fontSize(12).text(cell, currentX, currentY, { width: columnWidths[cellIndex], align: 'center' });
                        } else {
                            doc.font('DejaVuSans').fontSize(10).text(cell, currentX, currentY, { width: columnWidths[cellIndex], align: 'center' });
                        }
                        currentX += columnWidths[cellIndex];
                    });
                    currentY += 30; // Збільшуємо Y для наступного рядка (збільшена висота рядка)
                    currentX = left; // Повертаємо X на початок рядка
                });

                // Малюємо рамки для таблиці
                doc.lineWidth(0.5);
                for (let i = 0; i <= data.length; i++) {
                    doc.moveTo(left, top + i * 30) // Змінюємо на 30 для відповідної висоти рядка
                        .lineTo(left + columnWidths.reduce((a, b) => a + b, 0), top + i * 30)
                        .stroke();
                }

                for (let i = 0; i <= columnWidths.length; i++) {
                    doc.moveTo(left + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), top)
                        .lineTo(left + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), top + data.length * 30) // Змінюємо на 30
                        .stroke();
                }
            }

            // Додаємо заголовок таблиці
            drawTable(doc, [tableHeader], columnWidths, tableTop, tableLeft);

            // Додаємо дані таблиці
            const tableData = formattedResults.map(row => [
                row.Filtration_date,
                row.Volume,
                row.ParameterName || 'Немає',
                row.ProbaValue || 'Немає',
                row.MinValue || 'Немає',
                row.MaxValue || 'Немає'
            ]);

            drawTable(doc, tableData, columnWidths, tableTop + 30, tableLeft); // Змінюємо на 30

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
