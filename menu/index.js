const readline = require('readline');
const mongoose = require('mongoose');
const { Customer, Product, Order } = require('./models');

// Database Connection (Assuming your local DB is named 'ecommerce')
const DB_URI = 'mongodb://127.0.0.1:27017/ecommerceDB'; 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// A handy helper function to use async/await with readline
const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

async function mainMenu() {
    console.log("\n==================================");
    console.log("   ECOMMERCE INVENTORY SYSTEM");
    console.log("==================================");
    console.log("1. Add a New Customer");
    console.log("2. View All Products");
    console.log("3. Update Product Stock");
    console.log("4. Place an Order");
    console.log("5. Delete a Customer");
    console.log("6. View All Customers");
    console.log("7. View All Orders");
    console.log("8. View Orders by Customer (Join)");
    console.log("9. View Total Sales");
    console.log("10. View Top Spending Customer");
    console.log("11. Exit");
    console.log("==================================");

    const choice = await askQuestion("Choose an option (1-11): ");

    switch (choice.trim()) {
        case '1':
            console.log("\n--- Add New Customer ---");
            const name = await askQuestion("Name: ");
            const age = await askQuestion("Age: ");
            const city = await askQuestion("City: ");
            const gender = await askQuestion("Gender: ");
            
            await Customer.create({ name, age: parseInt(age), city, gender });
            console.log("✅ Customer added successfully!");
            break;

        case '2':
            console.log("\n--- Current Products ---");
            const products = await Product.find({}, '-_id name category price stock'); 
            console.table(products.map(p => p.toObject()));
            break;

        case '3':
            console.log("\n--- Update Stock ---");
            const prodName = await askQuestion("Enter exact Product Name: ");
            const newStock = await askQuestion("Enter new stock quantity: ");
            
            const updatedProduct = await Product.findOneAndUpdate(
                { name: prodName }, 
                { stock: parseInt(newStock) }, 
                { returnDocument: 'after' } // Updated to remove the deprecation warning
            );

            if (updatedProduct) {
                console.log(`✅ Stock updated! ${updatedProduct.name} now has ${updatedProduct.stock} items.`);
            } else {
                console.log("❌ Product not found.");
            }
            break;

        case '4':
            console.log("\n--- Place an Order ---");
            const cName = await askQuestion("Customer Name: ");
            const pName = await askQuestion("Product Name: ");
            const qty = parseInt(await askQuestion("Quantity: "));

            const productToBuy = await Product.findOne({ name: pName });

            if (!productToBuy) {
                console.log("❌ Product not found.");
            } else if (productToBuy.stock < qty) {
                console.log(`❌ Insufficient stock! Only ${productToBuy.stock} left.`);
            } else {
                const orderTotal = productToBuy.price * qty;
                await Order.create({ 
                    customerName: cName, 
                    productName: pName, 
                    quantity: qty, 
                    total: orderTotal 
                });

                productToBuy.stock -= qty;
                await productToBuy.save();

                console.log(`✅ Order placed! Total: Rs. ${orderTotal}. Stock updated.`);
            }
            break;

        case '5':
            console.log("\n--- Delete Customer ---");
            const delName = await askQuestion("Enter exact Customer Name to delete: ");
            const result = await Customer.deleteOne({ name: delName });
            
            if (result.deletedCount > 0) {
                console.log("✅ Customer deleted successfully.");
            } else {
                console.log("❌ Customer not found.");
            }
            break;

        case '6':
            console.log("\n--- All Customers ---");
            const customers = await Customer.find({}, '-_id name age city gender');
            console.table(customers.map(c => c.toObject()));
            break;

        case '7':
            console.log("\n--- All Orders ---");
            const orders = await Order.find({}, '-_id customerName productName quantity total');
            console.table(orders.map(o => o.toObject()));
            break;

        case '8':
            console.log("\n--- Orders by Customer (Join Operation) ---");
            const searchName = await askQuestion("Enter exact Customer Name: ");
            
            // The $lookup operator joins the 'orders' collection with the 'customers' collection
            const customerOrders = await Order.aggregate([
                { $match: { customerName: searchName } },
                {
                    $lookup: {
                        from: 'customers', // The target collection name in MongoDB
                        localField: 'customerName', // Field from the Orders collection
                        foreignField: 'name', // Field from the Customers collection
                        as: 'customerDetails' // The name of the new array added to the output
                    }
                }
            ]);

            if (customerOrders.length > 0) {
                // Formatting the output so it's readable in the terminal
                console.log(JSON.stringify(customerOrders, null, 2));
            } else {
                console.log(`❌ No orders found for ${searchName}.`);
            }
            break;

        case '9':
            console.log("\n--- Total Sales Revenue ---");
            // The $group operator with _id: null calculates a sum across ALL documents
            const totalSales = await Order.aggregate([
                { $group: { _id: null, grandTotal: { $sum: "$total" } } }
            ]);

            if (totalSales.length > 0) {
                console.log(`💰 Grand Total Sales: Rs. ${totalSales[0].grandTotal}`);
            } else {
                console.log("No sales recorded yet.");
            }
            break;

        case '10':
            console.log("\n--- Top Spending Customer ---");
            const topCustomer = await Order.aggregate([
                { $group: { _id: "$customerName", totalSpent: { $sum: "$total" } } },
                { $sort: { totalSpent: -1 } }, // Sort descending (highest first)
                { $limit: 1 } // Only keep the top result
            ]);

            if (topCustomer.length > 0) {
                console.log(`🏆 Top Customer: ${topCustomer[0]._id} with a total spend of Rs. ${topCustomer[0].totalSpent}`);
            } else {
                console.log("No orders found.");
            }
            break;

        case '11':
            console.log("Goodbye! Disconnecting from database...");
            await mongoose.disconnect();
            rl.close();
            return; 

        default:
            console.log("❌ Invalid choice. Please try again.");
    }

    await mainMenu();
}

// Start the application
async function startApp() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB successfully!");
        await mainMenu();
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
}

startApp();