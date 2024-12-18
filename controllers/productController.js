const { runDBCommand } = require("../db/connection");

const productController = {
    // Отримати всі продукти
    async getAll(req, res) {
        try {
            const query = "SELECT * FROM Product";
            const products = await runDBCommand(query);
            res.status(200).json(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Сталася помилка при отриманні продуктів", error });
        }
    },

    // Отримання кількості продукту на складі
    getProductQuantity: async (req, res) => {
        const { productId } = req.params;
        const query = `
            SELECT Quantity
            FROM ProductsOnWarehouse
            WHERE Product_id = '${productId}'
        `;

        try {
            const result = await runDBCommand(query);
            if (result.length > 0) {
                res.json({ quantity: result[0].Quantity });
            } else {
                res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            console.error('Error fetching product quantity:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Отримати продукт за ID
    async getById(req, res) {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        try {
            const query = `SELECT * FROM Product WHERE Product_id = '${productId}'`;
            const product = await runDBCommand(query);

            if (!product.length) {
                return res.status(404).json({ message: "Продукт не знайдено" });
            }

            res.status(200).json(product[0]);
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            res.status(500).json({ message: "Сталася помилка при отриманні продукту", error });
        }
    },

    // Додати новий продукт
    async add(req, res) {
        const { Product_name, Storage_unit, Details } = req.body;

        if (!Product_name || !Storage_unit) {
            return res.status(400).json({ message: "Поля Product_name та Storage_unit обов'язкові" });
        }

        try {
            const query = `
                INSERT INTO Product (Product_name, Storage_unit, Details) 
                VALUES ('${Product_name}', '${Storage_unit}', '${Details || ''}')
            `;
            await runDBCommand(query);

            res.status(201).json({ message: "Продукт успішно додано" });
        } catch (error) {
            console.error("Error adding product:", error);
            res.status(500).json({ message: "Сталася помилка при додаванні продукту", error });
        }
    },

    // Оновити продукт
    async update(req, res) {
        const { productId } = req.params;
        const { Product_name, Storage_unit, Details } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        try {
            const query = `
                UPDATE Product 
                SET Product_name = '${Product_name}', 
                    Storage_unit = '${Storage_unit}', 
                    Details = '${Details || ''}' 
                WHERE Product_id = '${productId}'
            `;
            const result = await runDBCommand(query);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Продукт не знайдено" });
            }

            res.status(200).json({ message: "Продукт успішно оновлено" });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Сталася помилка при оновленні продукту", error });
        }
    },

    // Перевірка кількості продуктів в кошику перед оформленням замовлення
    checkBusketQuantities: async (req, res) => {
        const sessionId = req.session.sessionId;
        const query = `
            SELECT 
                b.Busket_id AS busketId, 
                p.Product_name AS productName, 
                b.Quantity AS selectedQuantity, 
                pw.Quantity AS availableQuantity
            FROM 
                Busket b
            JOIN Price_change pc ON b.Price_change_id = pc.Price_change_id
            JOIN ProductsOnWarehouse pw ON pc.ProductsOnWarehouse_id = pw.ProductsOnWarehouse_id
            JOIN Product p ON pw.Product_id = p.Product_id
            WHERE b.Session_id = '${sessionId}';
        `;
    
        try {
            const results = await runDBCommand(query);
            const insufficientItems = results.filter(item => item.selectedQuantity > item.availableQuantity);
    
            if (insufficientItems.length > 0) {
                return res.status(400).json({
                    message: 'Insufficient stock for some items.',
                    details: insufficientItems
                });
            }
    
            res.status(200).json({ message: 'All quantities are valid.' });
        } catch (error) {
            console.error('Error checking busket quantities:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Оновлення складу після оформлення замовлення
    updateProductStock: async (req, res) => {
        const { productId } = req.params;
        const { quantity } = req.body; // кількість замовленого товару

        const query = `
            UPDATE ProductsOnWarehouse
            SET Quantity = Quantity - ${quantity}
            WHERE Product_id = '${productId}'
        `;

        try {
            const result = await runDBCommand(query);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found or insufficient stock.' });
            }

            res.status(200).json({ message: 'Stock updated successfully' });
        } catch (error) {
            console.error('Error updating stock:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Оновлення складу для всіх товарів після оформлення замовлення
    updateStocksAfterOrder: async (req, res) => {
        const items = req.body.items; // отримуємо масив продуктів і кількостей

        try {
            for (let item of items) {
                await runDBCommand(`
                    UPDATE ProductsOnWarehouse
                    SET Quantity = Quantity - ${item.quantity}
                    WHERE Product_id = '${item.productId}'
                `);
            }

            res.status(200).json({ message: 'Stock updated successfully after order.' });
        } catch (error) {
            console.error('Error updating stock after order:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Видалити продукт
    async delete(req, res) {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        try {
            const query = `DELETE FROM Product WHERE Product_id = '${productId}'`;
            const result = await runDBCommand(query);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Продукт не знайдено" });
            }

            res.status(200).json({ message: "Продукт успішно видалено" });
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ message: "Сталася помилка при видаленні продукту", error });
        }
    }
};

module.exports = productController;
