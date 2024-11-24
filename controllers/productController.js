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
