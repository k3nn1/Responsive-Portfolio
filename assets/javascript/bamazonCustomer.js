const mysql = require("mysql");
const inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors/safe");

// ===== MySQL Database Connection ======================
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
});

// ==== Connect to MySql Database ==================
connection.connect(function(err) {
    if(err) throw err;
    console.log("Connected as id: " + connection.threadId);
});

//===== Runs App ==========
runSearch();

//=========  This will run a search on the Database to see what we have for sale ==============
function runSearch() {
    // This creates a table  to display nicely in Terminal
    var table = new Table ({
        head: ["item id", "Item", "Price"],
        colWidths: [10, 20, 10]
    });
    // we link to our DB
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;
        console.log(colors.blue("\n --- WELCOME! ---"));
        console.log(colors.blue("--- Products We Have for Sale ---"));
        for (var i = 0; i < res.length; i++) {
            var id = res[i].item_id;
            var item = res[i].product_name;
            var price = res[i].price;
            // console.log("id: " + id + " | Item: " + item + " | Price: " + price);
            // console.log(res[i])
            table.push([id, item, price]);
        }
        console.log(table.toString());
        buy()
    });
}

// ======= starts the app to purchase products ======
function buy() {
    inquirer
        .prompt([{
           name: "product_id",
           type: "input",
           message: "What item ID you would like to buy?"
        }, {
            name: "quantity",
            type: "input",
            message: "How many you would like purchase?"
        }]).then(function(answer) {
            // console.log("answer: " + answer);
            
            var query = "SELECT stock_quantity FROM products WHERE item_id = ?"
            connection.query(query, [answer.product_id], function(err, res) {
                // Check stock inventory. If not, it'll console log and starts process again
                // console.log("==== res ====");
                // console.log(res);
                if (answer.quantity > res[0].stock_quantity) {
                    console.log("Sorry...Insufficient quantity!");
                    buy();
                }
                else {
                    // delete qty amount after purchase and calculate total price of purchase
                    var updateStock = res[0].stock_quantity - answer.quantity;
                    var query = "SELECT * FROM products WHERE item_id = ?"
                    connection.query(query, [answer.product_id], function(err, res) {
                        var selectedProduct = res[0].product_name;
                        var selectedProductPrice = res[0].price;
                        var totalPrice = parseFloat(selectedProductPrice * answer.quantity);
                        console.log("Your Total price: $" + totalPrice + " for " + selectedProduct);

                        // updata database after purchase
                        connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: updateStock
                        }, {
                            item_id: answer.product_id
                        }], function (err, res) {
                            if (err) throw err;
                            console.log(colors.green("!!Purchased Approved!! for: " + selectedProduct));
                            console.log(colors.red("====== END Purchase =======\n"));
                            // restarts the process again
                            runSearch();
                        });
                    });
                }
            });
        });
};
    
