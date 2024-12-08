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
            await runDBCommand(insertProductQuery); // Додаємо продукт до таблиці Product
            await runDBCommand(insertWarehouseProductQuery); // Додаємо продукт до складу
            await runDBCommand(priceChangeQuery); // Додаємо зміну ціни
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

    // Оновлення інформації про продукт
    async updateProductInWarehouse(req, res) {
        const { productId } = req.params;
        const { Product_name, Storage_unit, Image_name, Details, Quantity, Price_per_unit, Change_date } = req.body;
        console.log('req.body:', req.body);

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

        const priceChangeQuery = `
            INSERT INTO Price_change (ProductsOnWarehouse_id, Price_per_unit, Change_date)
            VALUES ((SELECT ProductsOnWarehouse_id FROM ProductsOnWarehouse WHERE Product_id = ${productId} LIMIT 1), ${Price_per_unit}, '${Change_date}')
        `;

        try {
            await runDBCommand(updateProductQuery); // Оновлюємо інформацію про продукт
            await runDBCommand(updateWarehouseProductQuery); // Оновлюємо кількість продукту
            await runDBCommand(priceChangeQuery); // Оновлюємо зміну ціни
            res.redirect('/tables/warehouse-products'); // Перенаправляємо на сторінку складів
        } catch (error) {
            console.error('Error updating product in warehouse:', error);
            res.status(500).send('Error updating product');
        }
    },

async deleteWarehouseProduct(req, res) {
    const { Product_id } = req.body;

    // Отримання ID запису в ProductsOnWarehouse
    const getProductsOnWarehouseIdQuery = `
        SELECT ProductsOnWarehouse_id
        FROM ProductsOnWarehouse
        WHERE Product_id = ${Product_id}
        LIMIT 1
    `;

    try {
        // Отримуємо ProductsOnWarehouse_id
        const result = await runDBCommand(getProductsOnWarehouseIdQuery);
        if (!result.length) {
            return res.status(404).send('Продукт не знайдено в складі');
        }

        const productsOnWarehouseId = result[0].ProductsOnWarehouse_id;

        // Видалення записів з WaterStation
        const deleteWaterStationQuery = `
            DELETE FROM WaterStation
            WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
        `;
        await runDBCommand(deleteWaterStationQuery);

        // Видалення записів з Busket
        const deleteBusketQuery = `
            DELETE FROM Busket
            WHERE Price_change_id IN (
                SELECT Price_change_id
                FROM Price_change
                WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
            )
        `;
        await runDBCommand(deleteBusketQuery);

        // Видалення записів з Price_change
        const deletePriceChangeQuery = `
            DELETE FROM Price_change
            WHERE ProductsOnWarehouse_id = ${productsOnWarehouseId}
        `;
        await runDBCommand(deletePriceChangeQuery);

        // Видалення записів з ProductsOnWarehouse
        const deleteProductsOnWarehouseQuery = `
            DELETE FROM ProductsOnWarehouse
            WHERE Product_id = ${Product_id}
        `;
        await runDBCommand(deleteProductsOnWarehouseQuery);

        // Видалення запису з Product
        const deleteProductQuery = `
            DELETE FROM Product
            WHERE Product_id = ${Product_id}
        `;
        await runDBCommand(deleteProductQuery);

        res.redirect('/tables/warehouse-products');
    } catch (error) {
        console.error('Error deleting warehouse product:', error);
        res.status(500).send('Error deleting warehouse product');
    }
}

};
