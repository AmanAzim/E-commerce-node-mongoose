const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then( order => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');//send as pdf
            res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);// to make the pdf open in the browser on click
            pdfDoc.pipe(fs.createReadStream(invoicePath));//It makes sure the genereted pdf also gets saved in the directory not only servein to client
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice', { underline: true });
            pdfDoc.text('----------------------------------------------');
            let totalPrice = 0;
            order.products.forEach( prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title+' - '+prod.quentity+' x '+' $ '+prod.product.price);
            });
            pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);
            pdfDoc.end();
            //For reading file (inefficient)
          /*fs.readFile(invoicePath, (err, data) => {
                if (err) {
                    return next(err);
                }
                res.setHeader('Content-Type', 'application/pdf');//send as pdf
                //res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);// to make the pdf open in the browser on click
                res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
                res.send(data);//To send as download file
            });*/

            //For streaming
          /*const file = fs.createReadStream(invoicePath);
            res.setHeader('Content-Type', 'application/pdf');//send as pdf
            res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);// to make the pdf open in the browser on click
            //res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
            file.pipe(res);//Forward the read data to response*/
        })
        .catch( err => next(err));
};