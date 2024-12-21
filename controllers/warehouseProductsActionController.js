const { runDBCommand } = require('../db/connection');

module.exports = {
    // Форма для додавання продукту
    async showAddProductForm(req, res) {
        try {
            // Отримання складів
            const warehousesQuery = `SELECT Warehouse_id, Type, Address FROM Warehouse`;
            const warehouses = await runDBCommand(warehousesQuery);

            // Передача складів у шаблон
            res.render('addWarehouseProduct', { warehouses });
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            res.status(500).send('Error fetching warehouses');
        }
    },

    // Додавання продукту до складу
    async addProductToWarehouse(req, res) {
        const { Warehouse_id, Product_name, Storage_unit, Image_name, Details, Quantity, Price_per_unit, Change_date } = req.body;

        // Перевірка обов'язкових полів
        if (!Warehouse_id || !Product_name || !Storage_unit || !Quantity || !Price_per_unit || !Change_date) {
            return res.status(400).send('All required fields must be filled');
        }

        const insertProductQuery = `
            INSERT INTO Product (Product_name, Storage_unit, Image_name, Details)
            VALUES ('${Product_name}', '${Storage_unit}', '${Image_name}', '${Details}')
        `;

        const insertWarehouseProductQuery = `
            INSERT INTO ProductsOnWarehouse (Warehouse_id, Product_id, Quantity)
            VALUES (${Warehouse_id}, LAST_INSERT_ID(), ${Quantity})
        `;

        const priceChangeQuery = `
            INSERT INTO Price_change (ProductsOnWarehouse_id, Price_per_unit, Change_date)
            VALUES (LAST_INSERT_ID(), ${Price_per_unit}, '${Change_date}')
        `;

        try {
            // Додаємо продукт до таблиці Product
            await runDBCommand(insertProductQuery);

            // Додаємо продукт до складу
            await runDBCommand(insertWarehouseProductQuery);

            // Додаємо зміну ціни
            await runDBCommand(priceChangeQuery);

            res.redirect('/tables/warehouse-products'); // Перенаправляємо на список продуктів
        } catch (error) {
            console.error('Error adding product to warehouse:', error);
            res.status(500).send('Error adding product');
        }
    },

    // Форма для редагування продукту
    async showEditProductForm(req, res) {
        const { productId } = req.params;

        try {
            // Отримання складів
            const warehousesQuery = `SELECT Warehouse_id, Type, Address FROM Warehouse`;
            const warehouses = await runDBCommand(warehousesQuery);

            // Отримання даних про продукт
            const productQuery = `
                SELECT
                    p.Product_id, 
                    p.Product_name, 
                    p.Storage_unit, 
                    p.Image_name, 
                    p.Details, 
                    pw.ProductsOnWarehouse_id, 
                    pw.Warehouse_id, 
                    pw.Quantity, 
                    pc.Price_per_unit, 
                    pc.Change_date
                FROM ProductsOnWarehouse pw
                LEFT JOIN Product p ON pw.Product_id = p.Product_id
                LEFT JOIN Price_change pc ON pw.ProductsOnWarehouse_id = pc.ProductsOnWarehouse_id
                WHERE pw.Product_id = ${productId}
            `;
            const productData = await runDBCommand(productQuery);

            // Передача даних у шаблон
            res.render('editWarehouseProduct', { product: productData[0], warehouses });
        } catch (error) {
            console.error('Error fetching product or warehouses:', error);
            res.status(500).send('Error fetching data');
        }
    },

    async updateProductInWarehouse(req, res) {
        const { productId } = req.params;
        const { Product_name, Storage_unit, Image_name, Details, Quantity, Price_per_unit, Change_date } = req.body;
    
        // Перевірка обов'язкових полів
        if (!productId || !Product_name || !Storage_unit || !Quantity || !Price_per_unit || !Change_date) {
            return res.status(400).send('All required fields must be filled');
        }
    
        const updateProductQuery = `
            UPDATE Product
            SET 
                Product_name = '${Product_name}',
                Storage_unit = '${Storage_unit}',
                Image_name = '${Image_name}',
                Details = '${Details}'
            WHERE Product_id = ${productId}
        `;
    
        const updateWarehouseProductQuery = `
            UPDATE ProductsOnWarehouse
            SET Quantity = '${Quantity}'
            WHERE Product_id = ${productId}
        `;
    
        const deleteOldPriceChangeQuery = `
            DELETE FROM Price_change
            WHERE ProductsOnWarehouse_id = (
                SELECT ProductsOnWarehouse_id 
                FROM ProductsOnWarehouse 
                WHERE Product_id = ${productId} 
                LIMIT 1
            )
        `;
    
        const priceChangeQuery = `
            INSERT INTO Price_change (ProductsOnWarehouse_id, Price_per_unit, Change_date)
            VALUES ((SELECT ProductsOnWarehouse_id FROM ProductsOnWarehouse WHERE Product_id = ${productId} LIMIT 1), ${Price_per_unit}, '${Change_date}')
        `;
    
        try {
            // Оновлюємо інформацію про продукт
            await runDBCommand(updateProductQuery);
    
            // Оновлюємо кількість продукту
            await runDBCommand(updateWarehouseProductQuery);
    
            // Видаляємо залежні записи з Orders
            const deleteOrdersQuery = `
                DELETE FROM Orders
                WHERE Busket_id IN (
                    SELECT Busket_id
                    FROM Busket
                    WHERE Price_change_id IN (
                        SELECT Price_change_id
                        FROM Price_change
                        WHERE ProductsOnWarehouse_id = (
                            SELECT ProductsOnWarehouse_id 
                            FROM ProductsOnWarehouse 
                            WHERE Product_id = ${productId} 
                            LIMIT 1
                        )
                    )
                )
            `;
            await runDBCommand(deleteOrdersQuery);
    
            // Видаляємо залежні записи з Busket
            const deleteBusketQuery = `
                DELETE FROM Busket
                WHERE Price_change_id IN (
                    SELECT Price_change_id
                    FROM Price_change
                    WHERE ProductsOnWarehouse_id = (
                        SELECT ProductsOnWarehouse_id 
                        FROM ProductsOnWarehouse 
                        WHERE Product_id = ${productId} 
                        LIMIT 1
                    )
                )
            `;
            await runDBCommand(deleteBusketQuery);
    
            // Видаляємо старі записи з Price_change
            await runDBCommand(deleteOldPriceChangeQuery);
    
            // Додаємо новий запис в Price_change
            await runDBCommand(priceChangeQuery);
    
            res.redirect('/tables/warehouse-products'); // Перенаправляємо на сторінку складів
        } catch (error) {
            console.error('Error updating product in warehouse:', error);
            res.status(500).send('Error updating product');
        }
    },
    async deleteWarehouseProduct(req, res) {
        const { Product_id } = req.body;
    
        // Validate Product_id
        if (!Product_id) {
            return res.status(400).send('Product_id is required');
        }
    
        const productId = parseInt(Product_id, 10);
        if (isNaN(productId)) {
            return res.status(400).send('Product_id must be a number');
        }
    
        // Check if the product exists
        const checkProductExistsQuery = `
            SELECT Product_id
            FROM Product
            WHERE Product_id = ${productId}
        `;
        const productExists = await runDBCommand(checkProductExistsQuery);
        if (!productExists.length) {
            return res.status(404).send('Продукт не знайдено');
        }
    
        // Get ProductsOnWarehouse_id
        const getProductsOnWarehouseIdQuery = `
            SELECT ProductsOnWarehouse_id
            FROM ProductsOnWarehouse
            WHERE Product_id = ${productId}
            LIMIT 1
        `;
        const result = await runDBCommand(getProductsOnWarehouseIdQuery);
        if (!result.length) {
            return res.status(404).send('Продукт не знайдено в складі');
        }
    
        const productsOnWarehouseId = result[0].ProductsOnWarehouse_id;
    
        try {
            // Delete dependent records in Price_change
            const deletePriceChangeQuery = `
                DELETE FROM Price_change
                WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
            `;
            await runDBCommand(deletePriceChangeQuery);
    
            // Delete dependent records in Orders
            const deleteOrdersQuery = `
                DELETE FROM Orders
                WHERE Busket_id IN (
                    SELECT Busket_id
                    FROM Busket
                    WHERE Price_change_id IN (
                        SELECT Price_change_id
                        FROM Price_change
                        WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
                    )
                )
            `;
            await runDBCommand(deleteOrdersQuery);
    
            // Delete dependent records in Busket
            const deleteBusketQuery = `
                DELETE FROM Busket
                WHERE Price_change_id IN (
                    SELECT Price_change_id
                    FROM Price_change
                    WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
                )
            `;
            await runDBCommand(deleteBusketQuery);
    
            // Delete the record in ProductsOnWarehouse
            const deleteProductsOnWarehouseQuery = `
                DELETE FROM ProductsOnWarehouse
                WHERE Product_id = ${productId}
            `;
            await runDBCommand(deleteProductsOnWarehouseQuery);
    
            // Delete the record in Product
            const deleteProductQuery = `
                DELETE FROM Product
                WHERE Product_id = ${productId}
            `;
            await runDBCommand(deleteProductQuery);
    
            res.redirect('/tables/warehouse-products');
        } catch (error) {
            console.error('Error deleting warehouse product:', error);
            res.status(500).send('Error deleting warehouse product');
        }
    }
};