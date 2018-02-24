CREATE DATABASE bamazon;

CREATE TABLE bamazon.product (
product_id INT(11) NOT NULL AUTO_INCREMENT,
product_name VARCHAR(80) NOT NULL,
dept_name VARCHAR(40) NOT NULL,
price DECIMAL(7,2) NOT NULL,
inventory INT(5) DEFAULT 0,
PRIMARY KEY (product_id)
);


INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('iPhone','Electronics','580.99',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('iPad','Electronics','910.00',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Macbook','Electronics','1880.99',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Geek Tshirt','Dress','5.99',100);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Jeans','Dress','20.00',50);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Frozen Pizza','Food','15.49',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Coke','Food','0.79',100);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Backback','Luggage','50.00',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Tennis Racket','Sports','80.99',10);
INSERT INTO bamazon.product(product_name, dept_name, price, inventory) VALUES('Tennis Shoe','Sports','48.00',10);

SELECT * FROM product;

ALTER TABLE bamazon.product ADD COLUMN total_sales DECIMAL(8,2) DEFAULT 0;

SELECT * FROM product;

CREATE TABLE bamazon.department (
dept_id INT(11) NOT NULL AUTO_INCREMENT,
dept_name VARCHAR(40) NOT NULL,
over_head_cost DECIMAL(7,2) NOT NULL,
PRIMARY KEY (dept_id)
);

INSERT INTO bamazon.department(dept_name, over_head_cost) VALUES('Electronics', 22000);
INSERT INTO bamazon.department(dept_name, over_head_cost) VALUES('Dress', 12000);
INSERT INTO bamazon.department(dept_name, over_head_cost) VALUES('Food', 54000);
INSERT INTO bamazon.department(dept_name, over_head_cost) VALUES('Luggage', 1000);
INSERT INTO bamazon.department(dept_name, over_head_cost) VALUES('Sports', 25000);

SELECT 
    dept.dept_id,
    dept.dept_name,
    dept.over_head_cost,
    dept_sales.total_dept_sales,
    (dept_sales.total_dept_sales - dept.over_head_cost) as profits
FROM
    department dept
        LEFT JOIN
    (SELECT 
        dept_name, COUNT(total_sales) AS total_dept_sales
    FROM
        product
    GROUP BY dept_name) dept_sales ON dept.dept_name = dept_sales.dept_name;