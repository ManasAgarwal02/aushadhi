var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var Product = require('./models/product');
var mongoose = require('mongoose');
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');
var flash = require('connect-flash');
const { session } = require('passport');

var csrfProtection = csrf();

var cart = new Map();

mongoose.connect('mongodb://localhost/aushadhi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// Product.create({
//     name: 'FabiFlu',
//     manufacturer: 'GlenMark',
//     tags : ['COVID-19', 'antibiotic'],
//     price: 30,
//     inStock: true,
//     image: "https://cdn.dnaindia.com/sites/default/files/styles/full/public/2020/06/22/910312-ani.jpg"
// }, (err, medicine)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log(medicine);
//     }
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'supersecret', resave: false, saveUnitialized:false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



app.get('/', (req, res)=>{
    Product.find({}, (err, products)=>{
        if(err){
            console.log(err);
        }else{
            res.render('index.ejs', {products: products});
        }
    });
});

app.get('/admin', (req, res)=>{
    res.render('signin.ejs');
});

app.get('/user/signin',function(req,res){
    res.render('signin',{csrfToken : req.csrfToken()});
});

app.post('/admin/', (req, res)=>{
    var product = req.body.product;
    var t = product.tags;
    var tags = t.split(" ");
    product.tags = tags;
    // console.log(product);
    var inSt = false;
    if(product.inStock == 'on') inSt = true;
    Product.create({
        name: product.name,
        manufacturer: product.manufacturer,
        tags : product.tags,
        price: product.price,
        inStock: inSt,
        image: product.image

    }, (err, newProduct)=>{
        if(err){
            console.log(err);
        }else{
            console.log(newProduct);
            res.redirect("/");
        }
    });
});

app.get('/cart',async (req, res)=>{
    var allProducts = [];
    for(var item in cart){
        await Product.findById(item, (err, product)=>{
            if(err){
                console.log(err);
            }else{
                var myItem = {
                    name: product.name,
                    freq: cart[item],
                    price: product.price
                };
                allProducts.push(myItem);
            }
        });
    }
    console.log(allProducts);
    res.render('cart.ejs', {cart : allProducts});
});

app.post('/addToCart', (req, res)=>{
    var item = req.body.itemId;
    if(!cart[item]){
        cart[item]=1;
    }else{
        cart[item] = cart[item]+1;
    }
    console.log(cart);
    res.redirect('/');
});

app.listen(3000, (req, res)=>{
    console.log("Server started....");
});