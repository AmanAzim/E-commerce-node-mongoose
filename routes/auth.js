const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');

const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please, enter a valid email')
            .normalizeEmail(),//convert the input in all lowercase
        body('password', 'Password must be at least 4 characters and alphanumeric')
            .isLength({ min: 4 })
            .isAlphanumeric()
            .trim()//remove extra space from input
    ],
    authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please, enter a valid email')
            .custom((value, {req}) => {// The custom validator for this will look for 3 possible values 1. a return true, 2. a thrown errer or 3. a return Promise
                /*
                if (value === 'test@test.com') {
                    throw new Error('This email is forbidden');
                }
                return true;//in case we succeed/ it is a different email*/
                return User.findOne({ email: value })
                    .then( existingUser => {
                        if (existingUser) {
                            return Promise.reject('This email already exists');//alternative or throwing error in case of Async validation
                        }
                    });
            })
            .normalizeEmail(),
        body('password', 'Password must be at least 4 characters and alphanumeric')//now this msg will be used for all the chained validator we don't need to use "withMessage()" for each of them
            .isLength({ min: 4 })
            .isAlphanumeric(),
        body('confirmPassword')
            .custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Password have to match');
                }
                return true;
            }),
    ],
    authController.postSignup
);//check() for validating user input

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;