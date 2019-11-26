const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');//for session
const MongoDBSrote = require('connect-mongodb-session')(session);//for storing the session in mongoDB
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

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
const errorController = require('./controllers/error');

//parses the raw request body sent through <form>
app.use(bodyParser.urlencoded({extended: false}));

//For non text files like image
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');//to store the file in the "images" folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);//to name the uploaded file
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('img')
);

//Serves static files such as css files// grant read access to static files// With this user can access the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));//if we have a request that that goes to this address than serve the files statically

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
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        next(new Error(err));// Inside then/catch/callback or any async code we need to throw error like this
    });
});

app.use((req, res, next) => {//all local variables that will be passed to all the views
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRouter);//only url with '/admin' will be handled by this route file

app.use(shopRouter);

app.use(authRouter);

app.get('/500', errorController.get500);

app.use((req, res, next) => {//It will handle all unknown routes
    res.status(404).render('404', { docTitle: 'Page Not Found', path: 'non'});
});

app.use((error, req, res, next) => {//Error handling middle ware
    //res.redirect('/500');// might cause infinite loop
    res.status(500).render('500', {
        docTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});

mongoose.connect(MONGODB_URI)
    .then( result => {
        app.listen(3000);
    }).catch(err => console.log(err));