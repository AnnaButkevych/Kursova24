CREATE TABLE Customer (
    Customer_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL,
    Phone_number VARCHAR(15) NOT NULL,
    Address TEXT,
    Email VARCHAR(100)
);

CREATE TABLE Courier (
    Courier_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL,
    Phone_number VARCHAR(15) NOT NULL,
    Courier_status ENUM('Вільний', 'Зайнятий', 'Відсутній') NOT NULL
);

CREATE TABLE Delivery (
    Delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    Delivery_address TEXT NOT NULL,
    Courier_id INT,
    FOREIGN KEY (Courier_id) REFERENCES Courier(Courier_id)
);

CREATE TABLE Payment_type (
    Payment_type_id INT PRIMARY KEY AUTO_INCREMENT,
    Type ENUM('готівка', 'картка', 'PayPal') NOT NULL,
    Details TEXT
);

CREATE TABLE Orders (
    Orders_id INT PRIMARY KEY AUTO_INCREMENT,
    Date DATE NOT NULL,
    Status VARCHAR(50),
    Sum DECIMAL(10, 2),
    Payment_type_id INT,
    Customer_id INT,
    Delivery_id INT,
    Busket_id INT,
    FOREIGN KEY (Payment_type_id) REFERENCES Payment_type(Payment_type_id),
    FOREIGN KEY (Customer_id) REFERENCES Customer(Customer_id),
    FOREIGN KEY (Delivery_id) REFERENCES Delivery(Delivery_id),
    FOREIGN KEY (Busket_id) REFERENCES Busket(Busket_id)
);

CREATE TABLE Busket (
    Busket_id INT PRIMARY KEY AUTO_INCREMENT,
    Session_id VARCHAR(100),
    Order_Water_id INT,
    IsProcessed BOOLEAN,
    FOREIGN KEY (Order_Water_id) REFERENCES Order_Water(Order_Water_id)
);

CREATE TABLE Order_Water (
    Order_Water_id INT PRIMARY KEY AUTO_INCREMENT,
    Orders_id INT,
    Price_change_id INT,
    Amount INT NOT NULL,
    FOREIGN KEY (Orders_id) REFERENCES Orders(Orders_id),
    FOREIGN KEY (Price_change_id) REFERENCES Price_change(Price_change_id)
);


CREATE TABLE Warehouse (
    Warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50) NOT NULL,
    Address TEXT NOT NULL
);

CREATE TABLE Product (
    Product_id INT PRIMARY KEY AUTO_INCREMENT,
    Product_name VARCHAR(100) NOT NULL,
    Storage_unit VARCHAR(50) NOT NULL,
    Details TEXT
);

CREATE TABLE ProductsOnWarehouse (
    ProductsOnWarehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    Warehouse_id INT,
    Product_id INT,
    Quantity INT NOT NULL,
    FOREIGN KEY (Warehouse_id) REFERENCES Warehouse(Warehouse_id),
    FOREIGN KEY (Product_id) REFERENCES Product(Product_id)
);

CREATE TABLE Price_change (
    Price_change_id INT PRIMARY KEY AUTO_INCREMENT,
    ProductsOnWarehouse_id INT,
    Price_per_unit DECIMAL(10, 2) NOT NULL,
    Change_date DATE NOT NULL,
    FOREIGN KEY (ProductsOnWarehouse_id) REFERENCES ProductsOnWarehouse(ProductsOnWarehouse_id)
);

CREATE TABLE WaterStation (
    WaterStation_id INT PRIMARY KEY AUTO_INCREMENT,
    ProductsOnWarehouse_id INT,
    Filtration_date DATE NOT NULL,
    Volume DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ProductsOnWarehouse_id) REFERENCES ProductsOnWarehouse(ProductsOnWarehouse_id)
);

CREATE TABLE Parameters (
    Parameters_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,
    MinValue DECIMAL(10, 2),
    `MaxValue` DECIMAL(10, 2),
    Details TEXT
);

CREATE TABLE WaterProbe (
    WaterProbe_id INT PRIMARY KEY AUTO_INCREMENT,
    WaterStation_id INT,
    ProbaValue DECIMAL(10, 2) NOT NULL,
    Parameters_id INT,
    FOREIGN KEY (WaterStation_id) REFERENCES WaterStation(WaterStation_id),
    FOREIGN KEY (Parameters_id) REFERENCES Parameters(Parameters_id)
);
