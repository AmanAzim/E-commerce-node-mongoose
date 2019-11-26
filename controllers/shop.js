const Product = require('../models/product');
const Order = require('../models/order');

exports.getDisplayProducts = (req, res, next) => {
    Product.find() //a mongoose method to retrieve the full collection
        .then( products => {
            res.render('shop/products-list', {
                products: products,
                docTitle: 'All Products',
                path: '/products-list',
            });// to render templates// send the data to the pug file
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProductDetail = (req, res, next) => {
    const productId = req.params.productId; //Same name we have to extract that we have assigned in the route/shop => /products/:productId
    Product.findById(productId)//mongoose method
        .then( product => {
            res.render('shop/product-details', {
                docTitle: product.title,
                product: product,
                path: '/products-list',
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then( products => {
           res.render('shop/index', {
                products: products,
                docTitle: 'Index',
                path: '/index',
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate()//extracts all the information found by the productId from the DB
        .then( user => {
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                cartProductsInfo: user.cart.items,
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then( product => {
            return req.user.addToCart(product);
        })
        .then( result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.postDeleteCartProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.removeFromCart(productId)
        .then( result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
   req.user.populate('cart.items.productId').execPopulate()
        .then( user => {
            const products = user.cart.items.map( item => {
                return { product: { ...item.productId._doc }, quantity: item.quantity };
            });
            const order = new Order({
               user: {
                   email: req.user.email,
                   userId: req.user._id
               },
               products: products,
            });
            return order.save();
        })
   .then( result => {
       return req.user.clearCart();
   })
   .then( result => {
       res.redirect('/cart');
   }).catch(err => {
       const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
   });
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then( orders => {
            res.render('shop/orders', {
                docTitle: 'Orders',
                path: '/orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        docTitle: 'Checkout',
        path: '/checkout',
    });
};