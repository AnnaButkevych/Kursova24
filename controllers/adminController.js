const { runDBCommand } = require('../db/connection');

const loginPage = async (req, res) => {
    res.render('adminLogin', {
        
    });
};

const findAdminByUsername = async (username) => {
    const query = `
        SELECT * FROM AdminUser
        WHERE UserName = '${username}'
    `;

    try {
        const rows = await runDBCommand(query);
        console.log('Результат пошуку адміністратора:', rows[0]);
        return rows[0];
    } catch (err) {
        console.error('Помилка пошуку адміністратора:', err);
    }
};

const loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const admin = await findAdminByUsername(username);

        if (!admin) {
            return res.status(404).send({ message: 'Admin not found' });
        }

        if (!(password == admin.Password)) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        res.status(200).send({ message: 'Login successful' });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error });
    }
};

module.exports = {loginAdmin, loginPage };
