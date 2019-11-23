const express = require('express');
const router = express.Router();//makes the middleware exportable

const adminController = require('../controllers/admin');

router.get('/add-product', adminController.getAddProducts);

router.post('/add-product', adminController.postAddProducts);

router.get('/products-list', adminController.getAdminProductsList);

router.get('/edit-product/:productId', adminController.getEditProducts); //Only in get request we can send params

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;