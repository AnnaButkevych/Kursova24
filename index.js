const express = require("express");
const path = require("path");
const router = express.Router();
const session = require("express-session");
const { runDBCommand } = require("./db/connection"); 
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
app.use(
  bodyParser.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 100000000000,
  })
);

app.use(
  session({
    secret: "your-secret-key", 
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: false }, 
  })
);

app.use((req, res, next) => {
  if (!req.session.sessionId) {
    req.session.sessionId = generateSessionId(); 
  }
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/resetSession", async (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/"); 
  });
});
app.get("/", async (req, res) => {
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
      return res.status(404).json({ message: "No products found" });
    }

    res.render("index", {
      title: "AcvaDel - Корисна вода",
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
const reportRoutes = require("./routes/report");
app.use(reportRoutes);

const orderRoute = require("./routes/order");
app.use("/order", orderRoute);

const busketRoutes = require("./routes/busket");
app.use("/busket", busketRoutes);

const productRoutes = require("./routes/product");
app.use("/products", productRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const adminDashboardRoutes = require("./routes/adminDashboard");
app.use("/admin", adminDashboardRoutes);

const couriersRouter = require("./routes/couriers");
app.use("/tables/couriers", couriersRouter);

const courierActionsRoutes = require("./routes/courierActions");
app.use("/courierActions", courierActionsRoutes);

const customersRouter = require("./routes/customers");
const deliveriesRouter = require("./routes/deliveries");
const statisticsRouter = require("./routes/statistics");
const analysisRouter = require("./routes/analysis");

app.use("/tables/customers", customersRouter);
app.use("/tables/deliveries", deliveriesRouter);
app.use("/statistics", statisticsRouter);
app.use("/analysis", analysisRouter);

const customersActionRoutes = require("./routes/customersAction");
app.use("/tables/customers", customersActionRoutes);

const warehouseProductsRouter = require("./routes/warehouseProducts");
const waterStationsRouter = require("./routes/waterStations");

app.use("/tables/warehouse-products", warehouseProductsRouter);
app.use("/tables/water-stations", waterStationsRouter);

const deliveryActionsRouter = require("./routes/deliveryActions");
app.use("/delivery", deliveryActionsRouter);

const userRepRoutes = require("./routes/userRep");
app.use("/userRep", userRepRoutes);

const warehouseProductsActionRoutes = require("./routes/warehouseProductsAction");
const warehouseProductsRoutes = require("./routes/warehouseProducts");
app.use("/tables/warehouse-products", warehouseProductsRoutes);
app.use("/warehouseProduct", warehouseProductsActionRoutes);

app.use("/", router);
app.listen(PORT, async () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);

  const open = await import("open");
  await open.default(`http://localhost:${PORT}`);
});

function generateSessionId() {
  return "session-" + Math.random().toString(36).substr(2, 9); 
}

module.exports = router;
