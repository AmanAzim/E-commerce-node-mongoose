const express = require('express');
const router = express.Router();//makes the middleware exportable
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProducts);

router.post('/add-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imgUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min: 8, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postAddProducts
);

router.get('/products-list', isAuth, adminController.getAdminProductsList);

router.get('/edit-product/:productId', isAuth, adminController.getEditProducts); //Only in get request we can send params

router.post('/edit-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imgUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min: 8, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;