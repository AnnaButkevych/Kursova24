const { runDBCommand } = require('../db/connection');
const PDFDocument = require('pdfkit');
const path = require('path');

module.exports = {
    async generatePdf(req, res) {
        try {
            const sessionId = req.session.sessionId;
            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }
    
            const busketQuery = `SELECT Busket_id FROM Busket WHERE Session_id = '${sessionId}';`;
            const busketResult = await runDBCommand(busketQuery);
    
            if (busketResult.length === 0) {
                return res.status(404).json({ error: 'No busket found for the current session' });
            }
    
            const busketId = busketResult[0].Busket_id;
    
            const orderQuery = `
                SELECT 
                    o.Orders_id, 
                    o.Date, 
                    o.Sum, 
                    o.Status, 
                    c.Name AS customer_name, 
                    c.Surname AS customer_surname, 
                    c.Phone_number, 
                    c.Address, 
                    c.Email, 
                    p.Type AS payment_type
                FROM Orders o
                INNER JOIN Customer c ON o.Customer_id = c.Customer_id
                INNER JOIN Payment_type p ON o.Payment_type_id = p.Payment_type_id
                WHERE o.Busket_id = '${busketId}'
                ORDER BY o.Date DESC
                LIMIT 1;
            `;
            const orderResult = await runDBCommand(orderQuery);
    
            if (orderResult.length === 0) {
                return res.status(404).json({ error: 'No order found for the current busket' });
            }
    
            const order = orderResult[0];
    
            const totalSum = isNaN(order.Sum) ? 0 : Number(order.Sum);
    
            const itemsQuery = `
                SELECT 
                    p.Product_name, 
                    b.Quantity, 
                    pc.Price_per_unit AS price_per_unit, 
                    (b.Quantity * pc.Price_per_unit) AS total_price
                FROM Busket b
                INNER JOIN Price_change pc ON b.Price_change_id = pc.Price_change_id
                INNER JOIN ProductsOnWarehouse pw ON pc.ProductsOnWarehouse_id = pw.ProductsOnWarehouse_id
                INNER JOIN Product p ON pw.Product_id = p.Product_id
                WHERE b.Session_id = '${sessionId}';
            `;
            const items = await runDBCommand(itemsQuery);
    
            // Генерація PDF (цей код залишається без змін)
            const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
            const doc = new PDFDocument();
            doc.registerFont('DejaVuSans', fontPath);
            doc.font('DejaVuSans');
    
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="order_${order.Orders_id}.pdf"`);
            doc.pipe(res);
    
            doc.fontSize(20).text('Order Receipt', { align: 'center' });
            doc.moveDown();
    
            const formattedDate = new Date(order.Date).toLocaleDateString('uk-UA');
            doc.fontSize(13).text(`Date: ${formattedDate}`);
            doc.text(`Customer: ${order.customer_name} ${order.customer_surname}`);
            doc.text(`Phone: ${order.Phone_number}`);
            doc.text(`Address: ${order.Address}`);
            doc.text(`Email: ${order.Email}`);
            doc.text(`Payment Type: ${order.payment_type}`);
            doc.text(`Status: ${order.Status}`);
            doc.moveDown();
    
            doc.fontSize(12).text('Order Items:', { underline: true });
            items.forEach((item, index) => {
                const pricePerUnit = Number(item.price_per_unit);
                const totalPrice = (item.Quantity * pricePerUnit).toFixed(2);
    
                const itemText = `- ${item.Product_name} (Quantity: ${item.Quantity}, Price: ${pricePerUnit.toFixed(2)} грн, Total: ${totalPrice} грн)`;
                doc.text(itemText);
    
                if (index < items.length - 1) doc.moveDown(0.5);
            });
    
            doc.moveDown();
            doc.fontSize(14).text(`Total Sum: ${totalSum.toFixed(2)} грн`, { align: 'right' });
    
            doc.moveDown();
            doc.fontSize(10).text(`Report Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
};
