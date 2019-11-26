exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        docTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
};