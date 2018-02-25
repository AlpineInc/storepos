function DatabaseUtil() {
    this.mysql = require("mysql");
    this.mysqlConfig = {
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'bamazon'
    };
    this.getProductsSql = "SELECT product_id, product_name, price, inventory FROM product";
    this.getLowInventoryProductsSql = "SELECT product_id, product_name, price, inventory FROM product WHERE inventory < 5";
    this.getProductInventorySql = "SELECT inventory FROM product WHERE product_id = ?";
    this.updateProductInventorySql = "UPDATE product SET inventory = inventory + ? WHERE product_id = ?";
    this.updateProductSalesSql = "UPDATE product SET total_sales = total_sales + (? * -1 * price) WHERE product_id = ?";
    this.addProductSql = "INSERT INTO product(product_name, dept_name, price, inventory) VALUES(?,?,?,?)";
    this.getSalesByDeptSql = "SELECT dept.dept_id, dept.dept_name, dept.over_head_cost, dept_sales.total_dept_sales,(dept_sales.total_dept_sales - dept.over_head_cost) as profits FROM department dept LEFT JOIN (SELECT dept_name, SUM(total_sales) AS total_dept_sales FROM product GROUP BY dept_name) dept_sales ON dept.dept_name = dept_sales.dept_name";
    this.connection = this.mysql.createConnection(this.mysqlConfig);
    this.close = function() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };
    this.getProducts = function() {
        return new Promise((resolve, reject) => {
            this.connection.query(this.getProductsSql, null, (err, products) => {
                if (err)
                    return reject(err);
                resolve(products);
            });
        });
    };
    this.getLowInventoryProducts = function() {
        return new Promise((resolve, reject) => {
            this.connection.query(this.getLowInventoryProductsSql, null, (err, products) => {
                if (err)
                    return reject(err);
                resolve(products);
            });
        });
    };
    this.getProductInventory = function(productId){
        return new Promise((resolve, reject) => {
            this.connection.query(this.getProductInventorySql, [productId], (err, inventory) => {
                if (err)
                    return reject(err);
                resolve(inventory);
            });
        });
    };
    this.getSalesByDept = function(productId){
        return new Promise((resolve, reject) => {
            this.connection.query(this.getSalesByDeptSql, null, (err, sales) => {
                if (err)
                    return reject(err);
                resolve(sales);
            });
        });
    };    
    this.updateProductInventory = function(productId, inventory){
        return new Promise((resolve, reject) => {
            this.connection.query(this.updateProductInventorySql, [inventory, productId], (err, updateStatus) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };
    this.updateProductSales = function(productId, inventory){
        return new Promise((resolve, reject) => {
            this.connection.query(this.updateProductSalesSql, [inventory, productId], (err, updateStatus) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }; 
    this.addProduct = function(productName, dept, price, inventory){
        return new Promise((resolve, reject) => {
            this.connection.query(this.addProductSql, [productName, dept, price, inventory], (err, updateStatus) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };         
}

module.exports = DatabaseUtil;