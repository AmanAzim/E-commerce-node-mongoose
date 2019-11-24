exports.getLogin = (req, res, next) => {
    //const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1] === 'true';
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isAuthenticated: false,
    });
};

exports.postLogin = (req, res, next) => {
    //res.setHeader('Set-Cookie', 'LoggedIn=true; HttpOnly'); //setting normal cookie
    req.session.isLoggedIn = true;
    res.redirect('/');
};

