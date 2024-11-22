const express = require('express');
const path = require('path');
const router = express.Router(); // Додаємо маршрутизатор


const app = express();
const PORT = 3000;

// Middleware для парсингу форми
app.use(express.urlencoded({ extended: true }));

// Встановлення EJS як шаблонізатора
app.set('views', path.join(__dirname, 'views')); // Шлях до views
app.set('view engine', 'ejs');

// Налаштування статичних файлів (CSS, зображення тощо)
app.use(express.static(path.join(__dirname, 'public')));

const orderRoute = require('./routes/order');
app.use(orderRoute);

// Маршрут для головної сторінки
router.get('/', (req, res) => {
  const products = [
    {
      name: 'Преміум',
      image: '/images/premium.png',
      description: 'Вода питна Преміум 1 бутель найвищої категорії якості. Проходить 7 етапів очищення.',
      regularPrice: '180.00',
      discountPrice: '160.00'
    },
    {
      name: 'Срібна',
      image: '/images/silver.png',
      description: 'Вода найвищої категорії якості, має оптимальний рівень мінералізації.',
      regularPrice: '160.00',
      discountPrice: '140.00'
    },
    {
      name: 'Пом\'якшена',
      image: '/images/softened.png',
      description: 'Вода питна Пом\'якшена найвищої категорії якості, проходить 7 етапів очищення.',
      regularPrice: '160.00',
      discountPrice: '140.00'
    }
  ];

  res.render('index', { 
    title: 'Аквасвіт - Корисна вода',
    products
  });
});

// Обробка запиту з форми
router.post('/request', (req, res) => {
  const { phone } = req.body;
  console.log(`Новий запит води від номера: ${phone}`);
  res.send(`
    <h1>Дякуємо! Ми зв'яжемося з вами за номером: ${phone}</h1>
    <a href="/">Повернутися на головну</a>
  `);
});

// Підключаємо маршрутизатор до основного додатку
app.use('/', router);

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
  
  // Динамічний імпорт ES-модуля "open"
  const open = await import('open');
  await open.default(`http://localhost:${PORT}`);
});
