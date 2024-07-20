const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerName: { type: String, required: true },
    customerContact: { type: Number, required: true },
    customerAddress: { type: String, required: true },
    products: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            description: {
                type: String,
                required: true
            },
            category:{
                type: String,
            }
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('order', orderSchema);