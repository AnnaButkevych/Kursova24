INSERT INTO Customer (Name, Surname, Phone_number, Address, Email) VALUES
('Олександр', 'Іванов', '+380671234567', 'Київ, вул. Шевченка, 10', 'ivanov@example.com'),
('Марія', 'Петренко', '+380681234567', 'Львів, вул. Грушевського, 15', 'petrenko@example.com'),
('Анна', 'Коваленко', '+380991234567', 'Одеса, вул. Дерибасівська, 5', 'kovalenko@example.com'),
('Олег', 'Сидоренко', '+380501234567', 'Харків, вул. Полтавський шлях, 20', 'sidorenko@example.com'),
('Вікторія', 'Гончар', '+380931234567', 'Дніпро, вул. Гагаріна, 3', 'gonchar@example.com');

INSERT INTO Courier (Name, Surname, Phone_number, Courier_status) VALUES
('Микола', 'Ткаченко', '+380671112233', 'Вільний'),
('Ігор', 'Кузьменко', '+380681112233', 'Зайнятий'),
('Катерина', 'Мельник', '+380991112233', 'Відсутній'),
('Дмитро', 'Олійник', '+380501112233', 'Вільний'),
('Світлана', 'Кравець', '+380931112233', 'Зайнятий');

INSERT INTO Delivery (Delivery_address, Courier_id) VALUES
('Київ, вул. Лесі Українки, 5', 1),
('Львів, вул. Франка, 10', 2),
('Одеса, вул. Пушкінська, 8', 3),
('Харків, вул. Сумська, 15', 4),
('Дніпро, проспект Яворницького, 12', 5);

INSERT INTO Payment_type (Type, Details) VALUES
('готівка', 'Оплата при отриманні'),
('картка', 'Visa/MasterCard'),
('PayPal', 'Міжнародні платежі');

INSERT INTO Orders (Date, Status, Sum, Payment_type_id, Customer_id, Delivery_id, Busket_id)
VALUES
('2024-11-01', 'Pending', 150.50, 1, 1, 1, 1),
('2024-11-02', 'Completed', 200.75, 2, 2, 2, 2),
('2024-11-03', 'Cancelled', 120.00, 3, 3, 3, 3),
('2024-11-04', 'Pending', 250.00, 1, 4, 1, 4),
('2024-11-05', 'Completed', 300.25, 2, 5, 2, 5);


INSERT INTO Warehouse (Type, Address) VALUES
('Основний', 'Київ, вул. Заводська, 7'),
('Додатковий', 'Львів, вул. Промислова, 12'),
('Резервний', 'Одеса, вул. Балківська, 20');

INSERT INTO Product (Product_name, Storage_unit, Details) VALUES
('Мінеральна вода', 'літр', 'Природна мінеральна вода'),
('Газована вода', 'літр', 'Слабо газована вода'),
('Столова вода', 'літр', 'Вода для щоденного вживання');

INSERT INTO ProductsOnWarehouse (Warehouse_id, Product_id, Quantity) VALUES
(1, 1, 500),
(1, 2, 300),
(2, 1, 400),
(2, 3, 200),
(3, 3, 150);

INSERT INTO Price_change (ProductsOnWarehouse_id, Price_per_unit, Change_date) VALUES
(1, 10.00, '2024-10-01'),
(2, 12.50, '2024-10-15'),
(3, 8.00, '2024-11-01'),
(4, 9.50, '2024-11-10'),
(5, 11.00, '2024-11-20');

INSERT INTO Order_Water (Orders_id, Price_change_id, Amount)
VALUES
(1, 1, 5),
(2, 2, 10),
(3, 3, 3),
(4, 4, 8),
(5, 5, 12);


INSERT INTO WaterStation (ProductsOnWarehouse_id, Filtration_date, Volume) VALUES
(1, '2024-10-20', 500.00),
(2, '2024-10-25', 300.00),
(3, '2024-11-05', 400.00);

INSERT INTO Parameters (Name, MinValue, MaxValue, Details) VALUES
('pH', 6.5, 8.5, 'Рівень кислотності'),
('Chlorine', 0.2, 0.5, 'Вміст хлору'),
('Hydrocarbons', 50, 150, 'Вміст гідрокарбонатів'),
('Chlorides', 10, 250, 'Вміст хлоридів'),
('Sulfates', 10, 250, 'Вміст сульфатів'),
('Nitrates', 0, 50, 'Вміст нітратів'),
('Copper', 0, 2, 'Вміст міді'),
('Aluminum', 0, 0.2, 'Вміст алюмінію');


INSERT INTO WaterProbe (WaterStation_id, ProbaValue, Parameters_id) VALUES
(1, 7.2, 1),
(1, 0.3, 2),
(1, 100, 3),
(1, 20, 4),
(1, 30, 5),
(1, 10, 6),
(1, 0.5, 7),
(1, 0.1, 8),
(2, 7.5, 1),
(2, 0.4, 2),
(2, 120, 3),
(2, 30, 4),
(2, 40, 5),
(2, 15, 6),
(2, 0.7, 7),
(2, 0.15, 8);
