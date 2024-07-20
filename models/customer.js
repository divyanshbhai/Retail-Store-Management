const mongoose = require('mongoose');

let customerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    address:{
        type: String,
        required: true
    }
})

let Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;