const inquirer = require("inquirer");
const CFonts = require("cfonts");
const { table } = require('table');
const DatabaseUtil = require("./database-util.js");
const database = new DatabaseUtil();
const log4js = require("log4js");
log4js.configure({
    appenders: { storePos: { type: "file", filename: "store-pos.log" } },
    categories: { default: { appenders: ["storePos"], level: "debug" } }
});
const logger = log4js.getLogger('cheese');




function displayBanner() {
    CFonts.say("Alpine POS", {
        font: "block", //define the font face 
        align: "left", //define text alignment 
        colors: ["white"], //define all colors 
        background: "Black", //define the background color 
        letterSpacing: 1, //define letter spacing 
        lineHeight: 1, //define the line height 
        space: true, //define if the output text should have empty lines on top and on the bottom 
        maxLength: '0' //define how many character can be on one line 
    });
}




function store() {
    logger.info("Staring Store Point Of Sale v1.0");
    mainMenu();
}




function mainMenu() {
    console.log('\033[2J');
    displayBanner();

    inquirer.prompt([{
        type: "list",
        message: "Menu:",
        choices: ["Make a Sale", "Manage Inventory", "Reports", "Shutdown"],
        name: "command"
    }]).then(function(userInput) {
        if (userInput.command == "Make a Sale") {
            console.log('\033[2J');
            displayBanner();

            checkout();
        } else if (userInput.command == "Manage Inventory") {
            console.log('\033[2J');
            displayBanner();

            manageInventory();
        } else if (userInput.command == "Reports") {
            console.log('\033[2J');
            displayBanner();

            reports();
        } else if (userInput.command == "Shutdown") {
            logger.info("Shutting down Point Of Sale..");
            database.close();
            process.exit();
        } else {
            logger.error("Unhandled user choice '" + userInput.command + "'");
            mainMenu();
        }
    });

}




function checkout() {
    displayProducts().then(function(status) {
        if (status === false) {
            console.log("Error getting products");
            mainMenu();
        }
        inquirer.prompt([{
                type: "input",
                message: "Enter the product id to checkout: ",
                name: "checkoutProductId"
            },
            {
                type: "input",
                message: "Enter the quatity: ",
                name: "checkoutProductQty"
            }
        ]).then(function(userInput) {
            makeASale(userInput.checkoutProductId, userInput.checkoutProductQty).then(function(status) {
                if (status) {
                    console.log("\n\nSuccessfully completed checkout\n\n");
                }
                inquirer.prompt([{
                    type: "list",
                    message: "Checkout Menu:",
                    choices: ["Make another Sale", "Return to Main Menu"],
                    name: "command"
                }]).then(function(userInput) {
                    if (userInput.command === "Make another Sale") {
                        checkout();
                    } else {
                        mainMenu();
                    }
                });

            });
        });

    });
};




function manageInventory() {
    inquirer.prompt([{
        type: "list",
        message: "Menu:",
        choices: ["View Products", "View Low Inventory", "Add Inventory", "Add New Product", "Return to Main Menu"],
        name: "command"
    }]).then(function(userInput) {
        if (userInput.command === "View Products") {
            displayProducts().then(function(status) {
                if (status === false) {
                    console.log("Error getting products");
                }
                manageInventory();
            });
        } else if (userInput.command === "View Low Inventory") {
            displayLowInventoryProducts().then(function(status) {
                if (status === false) {
                    console.log("Error getting products");
                }
                manageInventory();
            });
        } else if (userInput.command === "Add Inventory") {
            addProductInventory().then(function(status) {
                if (status === false) {
                    console.log("Error updating product inventory");
                }
                console.log("\n\nSuccessfully updated product inventory\n\n");
                manageInventory();
            });
        } else if (userInput.command === "Add New Product") {
            addProduct().then(function(status) {
                if (status === false) {
                    console.log("Error adding product");
                }
                console.log("\n\nSuccessfully added new product\n\n");
                manageInventory();
            });
        } else if (userInput.command === "Return to Main Menu") {
            mainMenu();
        }
    });

}




function reports() {
    inquirer.prompt([{
        type: "list",
        message: "Menu:",
        choices: ["Sales by Department", "Return to Main Menu"],
        name: "command"
    }]).then(function(userInput) {
        if (userInput.command === "Sales by Department") {
            reportSalesByDept().then(function(status) {
                if (status === false) {
                    console.log("Error getting report");
                }
                reports();
            });
        } else if (userInput.command === "Return to Main Menu") {
            mainMenu();
        }
    });

}




async function displayProducts() {
    try {
        var products = await database.getProducts();
    } catch (e) {
        logger.error("Error in getProducts function: " + e);
        return false;
    }
    var data = [
        ["Product Id", "Product Name", "Price", "Avl Inventory"]
    ];
    products.forEach(function(product) {
        var row = [product.product_id, product.product_name, product.price, product.inventory];
        data.push(row);
    });
    console.log(table(data));
    return true;
}




async function displayLowInventoryProducts() {
    try {
        var products = await database.getLowInventoryProducts();
    } catch (e) {
        logger.error("Error in getProducts function: " + e);
        return false;
    }
    var data = [
        ["Product Id", "Product Name", "Price", "Avl Inventory"]
    ];
    products.forEach(function(product) {
        var row = [product.product_id, product.product_name, product.price, product.inventory];
        data.push(row);
    });
    console.log(table(data));
    return true;
}




async function makeASale(productId, requestedInventory) {
    try {
        var availableInventory = await database.getProductInventory(productId);
        if (availableInventory[0].inventory < requestedInventory) {
            console.log("\n\nInsufficient inventory\n\n");
            return false;
        } else {
            await database.updateProductInventory(productId, parseFloat(requestedInventory) * -1);
            await database.updateProductSales(productId, parseFloat(requestedInventory) * -1);
            return true;
        }
    } catch (e) {
        logger.error("Error making a sale: " + e);
        return false;
    }
}




async function addProductInventory() {
    userInput = await inquirer.prompt([{
            type: "input",
            message: "Enter the product id to update: ",
            name: "productId"
        },
        {
            type: "input",
            message: "Enter the inventory quatity to add: ",
            name: "productQty"
        }
    ]);
    try {
        await database.updateProductInventory(userInput.productId, userInput.productQty);
    } catch (e) {
        logger.error("Error updating inventory: " + e);
        return false;
    }
    return true;
};




async function addProduct() {
    userInput = await inquirer.prompt([{
            type: "input",
            message: "Enter the product name: ",
            name: "productName"
        },
        {
            type: "input",
            message: "Enter the department: ",
            name: "dept"
        },
        {
            type: "input",
            message: "Enter the price: ",
            name: "price"
        },
        {
            type: "input",
            message: "Enter the starting inventory: ",
            name: "inventory"
        }
    ]);
    try {
        await database.addProduct(userInput.productName, userInput.dept, userInput.price, userInput.inventory);
    } catch (e) {
        logger.error("Error adding product: " + e);
        return false;
    }
    return true;
};



async function reportSalesByDept() {
    try {
        var depts = await database.getSalesByDept();
    } catch (e) {
        logger.error("Error in getSalesByDept function: " + e);
        return false;
    }
    var data = [
        ["Dept Id", "Dept Name", "Overhead Cost", "Total Sales", "Profit"]
    ];
    depts.forEach(function(dept) {
        var row = [dept.dept_id, dept.dept_name, dept.over_head_cost, dept.total_dept_sales, dept.profits];
        data.push(row);
    });
    console.log(table(data));
    return true;
}




store();