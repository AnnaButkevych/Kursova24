const express = require('express');
const path = require('path');
const router = express.Router();
const session = require('express-session');
const { runDBCommand } = require('./db/connection'); // Шлях до connection.js
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));

app.use(session({
  secret: 'your-secret-key',  // Secret key for session encryption
  resave: false,              // Don't save session if not modified
  saveUninitialized: true,    // Save session even if it hasn't been initialized
  cookie: { secure: false }   // Set secure to true for HTTPS (default is false)
}));

app.use((req, res, next) => {
  if (!req.session.sessionId) {
    // Automatically set a session ID if it doesn't exist
    req.session.sessionId = generateSessionId();  // You can customize this ID
  }
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Встановлення EJS як шаблонізатора
app.set('views', path.join(__dirname, 'views')); // Шлях до views
app.set('view engine', 'ejs');

// Налаштування статичних файлів (CSS, зображення тощо)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/resetSession', async (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/') // will always fire after session is destroyed
  })
});
// Product list controller
app.get('/', async (req, res) => {
  try {
    const session_id = req.session.sessionId;
    console.log("Session ID:", session_id);

    const productsQuery = `SELECT 
    pc.Price_change_id Product_id,
    p.Product_name,
    p.Storage_unit,
    p.Details,
    p.Image_name,
    pw.Quantity,
    pc.Price_per_unit
FROM
    Product p
JOIN ProductsOnWarehouse pw ON p.Product_id = pw.Product_id
JOIN Price_change pc ON pw.ProductsOnWarehouse_id = pc.ProductsOnWarehouse_id
JOIN (
    SELECT ProductsOnWarehouse_id, MAX(Change_date) AS max_change_date
    FROM Price_change
    GROUP BY ProductsOnWarehouse_id
) latest_price ON pc.ProductsOnWarehouse_id = latest_price.ProductsOnWarehouse_id
AND pc.Change_date = latest_price.max_change_date;`;

const products = await runDBCommand(productsQuery);



    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.render('index', {
      title: 'Аквасвіт - Корисна вода',
      products: products,

    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Підключення маршруту для замовлень
const orderRoute = require('./routes/order');
app.use('/order', orderRoute);

const busketRoutes = require('./routes/busket');
app.use('/busket', busketRoutes);

const productRoutes = require("./routes/product");
app.use("/products", productRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const adminDashboardRoutes = require('./routes/adminDashboard');
app.use('/admin', adminDashboardRoutes);

const couriersRouter = require('./routes/couriers');
app.use('/tables/couriers', couriersRouter);

const courierActionsRoutes = require('./routes/courierActions');
app.use('/courierActions', courierActionsRoutes);

const customersRouter = require('./routes/customers');
const deliveriesRouter = require('./routes/deliveries');
const statisticsRouter = require('./routes/statistics');
const analysisRouter = require('./routes/analysis');

app.use('/tables/customers', customersRouter);
app.use('/tables/deliveries', deliveriesRouter);
app.use('/statistics', statisticsRouter);
app.use('/analysis', analysisRouter);

const warehouseProductsRouter = require('./routes/warehouseProducts');
const waterStationsRouter = require('./routes/waterStations');

app.use('/tables/warehouse-products', warehouseProductsRouter);
app.use('/tables/water-stations', waterStationsRouter);

const deliveryActionsRouter = require('./routes/deliveryActions');

app.use('/delivery', deliveryActionsRouter);

const warehouseProductsActionRoutes = require('./routes/warehouseProductsAction');
const warehouseProductsRoutes = require('./routes/warehouseProducts');
app.use('/tables/warehouse-products', warehouseProductsRoutes);
app.use('/warehouseProduct', warehouseProductsActionRoutes);

app.use('/', router);

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
  
  // Динамічний імпорт модуля "open" для автоматичного відкриття в браузері
  const open = await import('open');
  await open.default(`http://localhost:${PORT}`);
});

function generateSessionId() {
  return 'session-' + Math.random().toString(36).substr(2, 9);  // Example of custom session ID generation
}

module.exports = router;