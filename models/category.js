const mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    }
})

let Category = mongoose.model('category', categorySchema);

module.exports = Category;