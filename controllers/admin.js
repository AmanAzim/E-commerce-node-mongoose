const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add products',
        path: '/add-product',
        editing: false,
    });
};

exports.postAddProducts = (req, res, next) => {
    const title = req.body.title;
    const imgUrl = req.body.imgUrl;
    const price = req.body.price;
    const description = req.body.description;
    const user = req.user;//req.user._id;//Mongoode will automitacally fick the _id

    const newProduct = new Product({title: title, imgUrl: imgUrl, price: price, description: description, userId: user});
    newProduct.save()
        .then( result => {
            res.redirect('/admin/products-list');
        }).catch(err => {
            console.log(err);
        });
};

exports.getAdminProductsList = (req, res, next) => {
     Product.find()// a mongoose method
        //.select('title price -_id')//only picks these fields from the collection bbut no id
        //.populate('userId', 'username')// check the full database to retrieve any data related the userId (means the user's username data)
        .then( products => {
            console.log(products);
            res.render('admin/products-list', {
                products: products,
                docTitle: 'Admin products list',
                path: 'admin/products-list'
            });
        })
        .catch(err => console.log(err));
};

exports.getEditProducts = (req, res, next) => {
     const editMode = req.query.edit;
     if ( !editMode ) {
        return res.redirect('/');
     }
     Product.findById(req.params.productId)
        .then( product => {
            if ( !product ) {
                return res.redirect('/admin/products-list');
            }
            res.render('admin/edit-product', {
                docTitle: 'Edit product',
                path: 'admin/edit-product',
                editing: editMode,
                product: product,
            });
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImgUrl = req.body.imgUrl;
    const updatedDescription = req.body.description;
    //const updatedUserId = req.user._id;// No need mongoose will take care of it

    Product.findById(productId)
         .then( product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imgUrl = updatedImgUrl;
            product.description = updatedDescription;
            return product.save();
         })
         .then( result => {
            res.redirect('/admin/products-list');
         }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByIdAndRemove(productId).then(() => {
        res.redirect('/admin/products-list');
    }).catch(err => console.log(err));
};