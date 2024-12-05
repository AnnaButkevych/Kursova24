const { runDBCommand } = require('../db/connection');

module.exports = {
    async getWarehousesWithProducts(req, res) {
        const query = `
            SELECT 
                w.Warehouse_id,
                w.Type AS WarehouseType,
                w.Address AS WarehouseAddress,
                p.Product_id,
                p.Product_name,
                p.Storage_unit,
                pw.Quantity,
                pc.Price_per_unit,
                pc.Change_date
            FROM Warehouse w
            LEFT JOIN ProductsOnWarehouse pw ON w.Warehouse_id = pw.Warehouse_id
            LEFT JOIN Product p ON pw.Product_id = p.Product_id
            LEFT JOIN Price_change pc ON pw.ProductsOnWarehouse_id = pc.ProductsOnWarehouse_id
            ORDER BY w.Warehouse_id, p.Product_id;
        `;

        try {
            const results = await runDBCommand(query);
            const formattedResults = results.map(row => ({
                ...row,
                Change_date: row.Change_date ? new Date(row.Change_date).toLocaleDateString('uk-UA') : 'Немає',
            }));
            
            res.render('warehouseProducts', { results });
        } catch (error) {
            console.error('Error fetching warehouse and product data:', error);
            res.status(500).send('Error retrieving data');
        }
    },
};
