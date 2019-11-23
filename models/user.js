const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectID, required: true, ref: 'Product' },
                quantity: { type: Number, required: true}
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const updatedCartItems = [...this.cart.items];
    let newQuentity = 1;

    const cartProductIndex = this.cart.items.findIndex(
        cartProduct => cartProduct.productId.toString() === product._id.toString()
    );

    if ( cartProductIndex >= 0 ) {
        newQuentity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuentity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: newQuentity });
    }

    this.cart = { items: updatedCartItems };
    return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter( item => item.productId.toString() !== productId.toString() );
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
/*
const mongoDB = require('mongodb');
const getDB = require('../util/database').getDB;

class  User {
    constructor(username, email, cart, userId) {
        this.username = username;
        this.email = email;
        this.cart = cart;
        this.userId = userId;
    }

    save() {
        const db = getDB();
        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
        const db = getDB();

        const updatedCartItems = [...this.cart.items];
        let newQuentity = 1;

        const cartProductIndex = this.cart.items.findIndex(
            cartProduct => cartProduct.productId.toString() === product._id.toString()
        );

        if ( cartProductIndex >= 0 ) {
            newQuentity = this.cart.items[cartProductIndex].quentity + 1;
            updatedCartItems[cartProductIndex].quentity = newQuentity;
        } else {
            updatedCartItems.push({ productId: new mongoDB.ObjectID(product._id), quentity: newQuentity });
        }

        const updatedCart = { items: updatedCartItems };
        return db.collection('users').updateOne(
                { _id: new mongoDB.ObjectID(this.userId) },
                { $set: { cart: updatedCart }, //just update the cart
            });
    }

    getCart() {
        const db = getDB();
        const productIds = this.cart.items.map( item => item.productId );
        return db.collection('products').find({ _id: {$in: productIds}})
            .toArray() //converts the returned cursor in to array
            .then( products => {
                return products.map( product => {
                    const quentity = this.cart.items.find( item => item.productId.toString() === product._id.toString() ).quentity;
                    return {...product, quentity};
                });
            })
            .catch(err => console.log(err));//find the product where the _id is equal to any of the ids from the "productIds" array
    }

    addOrder() {
        const db = getDB();
        return this.getCart().then( products => {
            const order = {
                items: products,
                user: {
                    _id: new mongoDB.ObjectID(this.userId),
                    username: this.username,
                }
            };
            db.collection('orders').insertOne(order);
        })
        .then( result => {
            this.cart = { items: [] };
            return db.collection('users').updateOne(
                { _id: new mongoDB.ObjectID(this.userId) },
                { $set: { cart: this.cart }, //just update the cart to be empty
            });
        })
        .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDB();
        return db.collection('orders').find({ 'user._id': new mongoDB.ObjectID(this.userId) })
            .toArray();
    }

    deleteItemFromCart(productId) {
        const db = getDB();
        const updatedCartItems = this.cart.items.filter( item => item.productId.toString() !== productId.toString() );

        return db.collection('users').updateOne(
                { _id: new mongoDB.ObjectID(this.userId) },
                { $set: { cart: { items: updatedCartItems } }, //just update the cart
            });
    }

    static findUserById(id) {
        const db = getDB();
        //return db.collection('users').find({ _id: new mongoDB.ObjectID(id) }).next(); //alternative
        return db.collection('users').findOne({_id: new mongoDB.ObjectID(id)});
    }
}

module.exports = User;
*/