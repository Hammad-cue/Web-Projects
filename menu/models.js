const mongoose = require('mongoose');

// Schemas are designed to match the images you provided exactly
const customerSchema = new mongoose.Schema({
    name: String,
    age: Number,
    city: String,
    gender: String
}, { versionKey: false }); // versionKey: false prevents Mongoose from adding a '__v' field to your existing data

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    stock: Number
}, { versionKey: false });

const orderSchema = new mongoose.Schema({
    customerName: String,
    productName: String,
    quantity: Number,
    total: Number
}, { versionKey: false });

// Export the models. Mongoose automatically looks for the lowercase, pluralized versions 
// of these names in your database (i.e., 'customers', 'products', 'orders').
module.exports = {
    Customer: mongoose.model('Customer', customerSchema),
    Product: mongoose.model('Product', productSchema),
    Order: mongoose.model('Order', orderSchema)
};