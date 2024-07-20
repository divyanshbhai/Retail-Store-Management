const mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category:{
        type: String,
    }
})

let Product = mongoose.model('product', productSchema);

module.exports = Product;