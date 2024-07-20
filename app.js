const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Category = require('./models/category.js');
const Product = require('./models/product.js');
const Customer = require('./models/customer.js');
const Order = require('./models/order.js');


app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.set('views', path.join(__dirname, '/views'));
app.use(express.urlencoded({extended: true}));
app.engine('ejs', ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


main().then(()=>{
    console.log('DB connected');
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/SMS');
}


app.get('/', async (req, res) => {
    const totalCustomers = await Customer.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const orders = await Order.find({});
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const productSales = {};
    const monthlySales = {};
    const productCategorySales = {};
    orders.forEach(order => {
        const orderMonth = order.orderDate.getMonth() + 1;
        if (!monthlySales[orderMonth]) {
            monthlySales[orderMonth] = 0;
        }
        monthlySales[orderMonth] += order.totalAmount;

        order.products.forEach(product => {
            if (productSales[product.name]) {
                productSales[product.name] += product.quantity;
            } else {
                productSales[product.name] = product.quantity;
            }

            if (productCategorySales[product.category]) {
                productCategorySales[product.category] += product.quantity;
            } else {
                productCategorySales[product.category] = product.quantity;
            }
        });
    });
    const mostSellingProduct = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b);   
    const sortedProductSales = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
    const top5Products = sortedProductSales.slice(0, 5);
    res.render('layout/dashboard/report.ejs', { totalCustomers, totalOrders, totalAmount, mostSellingProduct, mostSellingProductQuantity: productSales[mostSellingProduct], monthlySales, productCategorySales, top5Products });
});



// Category Section
app.get('/category', async (req,res)=>{
    let categories = await Category.find({});
    res.render('layout/category/listing.ejs', {categories});
})

app.post('/category', async (req, res) => {
    const formData = req.body;
    console.log(formData);
    const category = new Category(formData);
    await category.save();
    res.send('done');
});

app.put('/category', async (req, res) => {
    const formData = req.body;
    console.log(formData);
    await Category.findByIdAndUpdate(formData.id, {name: formData.name});
    res.send('done');
});

app.delete('/category', async (req, res) => {
    const formData = req.body;
    console.log(formData);
    await Category.findByIdAndDelete(formData.id);
    res.send('done');
});
// End Category Section



// Product Section
app.get('/product', async (req, res)=>{
    let products = await Product.find({});
    res.render('layout/product/listing.ejs', {products});
})

app.get('/product/add', async (req, res)=>{
    let categories = await Category.find({})
    res.render('layout/product/add.ejs', {categories});
})

app.get('/product/:id', async (req, res)=>{
    let {id}  = req.params;
    let product = await Product.findById(id);
    res.render('layout/product/show.ejs', {product});
})

app.get('/product/:id/update', async (req, res)=>{
    let {id}  = req.params;
    let product = await Product.findById(id);
    let categories = await Category.find({})
    res.render('layout/product/update.ejs', {product, categories});
})

app.put('/product/:id', async (req, res)=>{
    let {id}  = req.params;
    let product = await Product.findByIdAndUpdate(id, req.body.product)
    res.redirect('/product/'+id)
})

app.post('/product', async (req, res) => {
    const product = new Product(req.body.product);
    await product.save();
    res.redirect('/product');
});

app.delete('/product/:id', async (req, res)=>{
    let {id}  = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/product')
})
// End Product Section



// Customer Section
app.get('/customer', async (req, res)=>{
    let customers = await Customer.find({});
    res.render('layout/customer/listing.ejs', {customers});
})

app.get('/customer/add', async (req, res)=>{
    res.render('layout/customer/add.ejs');
})

app.get('/customer/:id', async (req, res)=>{
    let {id}  = req.params;
    let customer = await Customer.findById(id);
    res.render('layout/customer/show.ejs', {customer});
})

app.get('/customer/:id/update', async (req, res)=>{
    let {id}  = req.params;
    let customer = await Customer.findById(id);
    res.render('layout/customer/update.ejs', {customer});
})

app.post('/customer', async (req, res)=>{
    const customer = new Customer(req.body.customer);
    await customer.save();
    res.redirect('/customer');
})

app.put('/customer/:id', async (req, res)=>{
    let {id}  = req.params;
    await Customer.findByIdAndUpdate(id, req.body.customer)
    res.redirect('/customer/'+id)
})

app.delete('/customer/:id', async (req, res)=>{
    let {id}  = req.params;
    await Customer.findByIdAndDelete(id)
    res.redirect('/customer');
})
// End Customer Section



// Order Section

app.get('/order', async (req, res)=>{
    let orders = await Order.find({});
    res.render('layout/order/listing.ejs', {orders});
})

app.get('/order/add', async (req, res)=>{
    let customers = await Customer.find({});
    let products = await Product.find({});
    res.render('layout/order/add.ejs', {customers, products});
})


app.get('/order/:id', async (req, res)=>{
    let {id}  = req.params;
    let order = await Order.findById(id);
    res.render('layout/order/show.ejs', {order});
})

app.get('/order/:id/update', async (req, res)=>{
    const orderId = req.params.id;
    const order = await Order.findById(orderId); // Fetch the order by ID
    const customers = await Customer.find(); // Fetch all customers
    const products = await Product.find(); // Fetch all products
    res.render('layout/order/update.ejs', { order, customers, products });
})

app.post('/order',  async (req, res)=>{
    let order = new Order(req.body.order);
    let status = req.body.order.status;
    if(status!='Pending' || status!='Shipped' || status!='Delivered' || status!='Completed'){
        for(product of req.body.order.products){
            let productDoc = await Product.findOne({ name: product.name });
                if (productDoc) {
                    if (productDoc.quantity >= product.quantity) {
                        productDoc.quantity -= product.quantity;
                        await productDoc.save();
                    }
        }
    }
    await order.save();
    res.redirect('/order');
}
})

app.put('/order/:id', async (req, res)=>{
    let {id}  = req.params;
    console.log(req.body.order)
    let status = req.body.order.status;
    if(status!='Pending' || status!='Shipped' || status!='Delivered' || status!='Completed'){
        for(product of req.body.order.products){
            let productDoc = await Product.findOne({ name: product.name });
                if (productDoc) {
                    if (productDoc.quantity >= product.quantity) {
                        productDoc.quantity -= product.quantity;
                        await productDoc.save();
                    }
        }
    }
    await Order.findByIdAndUpdate(id, req.body.order)
    res.redirect('/order/'+id)
}
})

app.delete('/order/:id', async (req, res)=>{
    let {id}  = req.params;
    await Order.findByIdAndDelete(id)
    res.redirect('/order')
});

// End Order Section


// Billing Section
app.get('/bill', async (req, res)=>{
    let orders = await Order.find({status: 'Completed'});
    res.render('layout/billing/listing.ejs', {orders});
})

app.get('/bill/:id', async (req, res)=>{
    let {id}  = req.params;
    let order = await Order.findById(id);
    res.render('layout/billing/bill.ejs', {order});
})

app.listen(8080, ()=>{
    console.log('Listing port: 8080')
})