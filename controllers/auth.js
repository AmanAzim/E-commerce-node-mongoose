const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/user');

const transport = nodeMailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = (req, res, next) => {
    //const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1] === 'true';
    const errorMsg = req.flash('errorMsg').length > 0 ? req.flash('errorMsg')[0] : null;

    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: errorMsg,
        validationError: [],
        oldInput: { email: '', password: '' }
    });
};

exports.postLogin = (req, res, next) => {
    //res.setHeader('Set-Cookie', 'LoggedIn=true; HttpOnly'); //setting normal cookie
    const email = req.body.email;
    const password = req.body.password;
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        console.log('validationErrors', validationErrors.array());
        return res.status(422).render('auth/login', {
            docTitle: 'Login',
            path: '/login',
            errorMessage: validationErrors.array()[0].msg,
            validationError: validationErrors.array(),
            oldInput: { email: email, password: password }
        });
    }

    User.findOne({ email: email })
        .then( user => {

            if (!user) {

                 return res.status(422).render('auth/login', {
                    docTitle: 'Login',
                    path: '/login',
                    errorMessage: 'Invalid email or password',
                    validationError: [],
                    oldInput: { email: email, password: password }
                 });
            }

            bcrypt.compare(password, user.password)
                .then( doMatch => {

                    if (doMatch) {
                        req.session.user = user;//a full mongoose model
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });//to make sure the session is created
                    }
                    return res.status(422).render('auth/login', {
                        docTitle: 'Login',
                        path: '/login',
                        errorMessage: 'Invalid email or password',
                        validationError: [],
                        oldInput: { email: email, password: password }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        }).catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    const errorMsg = req.flash('errorMsg').length > 0 ? req.flash('errorMsg')[0] : null;
    res.render('auth/signup', {
        docTitle: 'Signup',
        path: '/signup',
        errorMessage: errorMsg,
        validationError: [],
        oldInput: { email: '', password: '', confirmPassword: '' }
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            docTitle: 'Signup',
            path: '/signup',
            errorMessage: validationErrors.array()[0].msg,
            validationError: validationErrors.array(),
            oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword }
        });
    }

    bcrypt.hash(password, 12)//12 round of hashing
        .then( hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then( result => {
            res.redirect('/login');
            console.log(email)
            return transport.sendMail({
                to: email,
                from: 'shop@node-aman.com',
                subject: 'Signup succeeded',
                html: '<h1>You successfully signed up</h1>'
            }).then( resu => console.log(resu));
        }).catch( err => console.log(err));
};

exports.getResetPassword = (req, res, next) => {
    const errorMsg = req.flash('error').length > 0 ? req.flash('error')[0] : null;
    res.render('auth/reset-password', {
        docTitle: 'Reset password',
        path: '/reset-password',
        errorMessage: errorMsg,
    });
};

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err ,buffer) => {//to generate reset password token
        if (err) {
            console.log(err);
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then( user => {
                if (!user) {
                    req.flash('error', 'No account with this email found !');
                    return res.redirect('/reset-password');
                }
                user.resetPassToken = token;
                user.resetPassTokenExpiration = Date.now() + 3600000; //expires in 1 hour
                return user.save();
            })
            .then( result => {
                res.redirect('/');
                return transport.sendMail({
                        to: req.body.email,
                        from: 'shop@node-aman.com',
                        subject: 'Password reset',
                        html: `<p>You requested a password reset</p>
                               <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to reset password.</p>`
                    }).then( resu => console.log(resu));
            })
            .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetPassToken: token, resetPassTokenExpiration: {$gt: Date.now()} })//if the expiration time is greater than now/current time
        .then( user => {
            const errorMsg = req.flash('error').length > 0 ? req.flash('error')[0] : null;
            res.render('auth/new-password', {
                docTitle: 'New password',
                path: '/new-password',
                errorMessage: errorMsg,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err =>console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetPassToken: passwordToken, resetPassTokenExpiration: {$gt: Date.now()}, _id: userId })
        .then( user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then( hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetPassToken = undefined;
            resetUser.resetPassTokenExpiration = undefined;
            return resetUser.save()
        })
        .then( result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};
