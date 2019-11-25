const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    //const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1] === 'true';
    const errorMsg = req.flash('errorMsg').length > 0 ? req.flash('errorMsg')[0] : null;

    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: errorMsg,
    });
};

exports.postLogin = (req, res, next) => {
    //res.setHeader('Set-Cookie', 'LoggedIn=true; HttpOnly'); //setting normal cookie
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then( user => {

            if (!user) {
                req.flash('errorMsg', 'Invalid email or password');
                return res.redirect('/login');
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
                        return res.redirect('/');
                    }
                    req.flash('errorMsg', 'Invalid password');
                    res.redirect('/login');
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
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
        .then( existingUser => {
            if (existingUser) {
                req.flash('errorMsg', 'Email exists already, please pick a different one');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)//12 round of hashing
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
                });
        })
        .catch(err => console.log(err));
};

