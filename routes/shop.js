const express = require('express');
const path = require('path');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/', shopController.getIndex);

router.get('/products-list', shopController.getDisplayProducts);

router.get('/products-list/:productId', shopController.getProductDetail);// We have to put route with dynamic segment after any route with same path structure

//router.post('/cart', isAuth, shopController.postCart);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCartProduct);

//router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.post('/checkout/cancel', shopController.getCheckout);


module.exports = router;