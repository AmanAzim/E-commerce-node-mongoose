const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');//for session
const MongoDBSrote = require('connect-mongodb-session')(session);//for storing the session in mongoDB
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb+srv://aman_azim:aman@cluster0-hq0lj.mongodb.net/shop';

const store = new MongoDBSrote({
    uri: MONGODB_URI, //store the session in this db
    collection: 'session', //the name of the collection in mongoDB where it will be stored
    //cookie: {}// to store cookie related info
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');//"set" allows us to set any blobal value in our app. can be key-value.//Use "pug" as view creating engine
app.set('views', 'views');// Find the views from "views" directory.

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const User = require('./models/user');

//parses the raw request body sent through <form>
app.use(bodyParser.urlencoded({extended: false}));

//Serves static files such as css files// grant read access to static files// With this user can access the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'my secret',
    resave: false,//Session will not be saved for every request/response but only if something changed in the session
    saveUninitialized: false, //If session is not changed then it will not get initialized
    store: store,
}));

app.use(csrfProtection);

app.use(flash());// it will allow us to store error message in a session before redirecring and delete the message from session after showing it 1 time

app.use((req, res, next) => {
    if ( !req.session.user ) {
        return next();
    }
    User.findById(req.session.user._id)
    .then( user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
});

app.use((req, res, next) => {//all local variables that will be passed to all the views
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRouter);//only url with '/admin' will be handled by this route file

app.use(shopRouter);

app.use(authRouter);

app.use((req, res, next) => {//It will handle all unknown routes
    res.status(404).render('404', { docTitle: 'Page Not Found', path: 'non'});
});

mongoose.connect(MONGODB_URI)
    .then( result => {
        app.listen(3000);
    }).catch(err => console.log(err));