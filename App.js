const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');

app.set('view engine', 'ejs');//"set" allows us to set any blobal value in our app. can be key-value.//Use "pug" as view creating engine
app.set('views', 'views');// Find the views from "views" directory.

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const User = require('./models/user');

//parses the raw request body sent through <form>
app.use(bodyParser.urlencoded({extended: false}));

//Serves static files such as css files// grant read access to static files// With this user can access the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5dd951731ee06802247dc9b8')
        .then( user => {
            req.user = user;//a full mongoose model
            next();
        }).catch(err => console.log(err));
});

app.use('/admin', adminRouter);//only url with '/admin' will be handled by this route file

app.use(shopRouter);

app.use((req, res, next) => {//It will handle all unknown routes
    res.status(404).render('404', { docTitle: 'Page Not Found', path: 'non'});
});

mongoose.connect('mongodb+srv://aman_azim:aman@cluster0-hq0lj.mongodb.net/shop?retryWrites=true&w=majority')
    .then( result => {
        User.findOne().then( user => {
            if (!user) {
                 const user = new User({
                    username: 'aman',
                    email: 'aman@gmail.com',
                    cart: {
                        items: []
                    }
                 });
                 user.save();
            }
        });

        app.listen(3000);
    }).catch(err => console.log(err));