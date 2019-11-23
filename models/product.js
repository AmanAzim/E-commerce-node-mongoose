const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    userId: {
        type: Schema.Types.ObjectID,
        required: true,
        ref: 'User' //It is the model name with which it should make relation
    }
});

//Now it will be exported as "Product" // Mongoose will take the name "Product" and convert it to lowercase+plural and save it as collection in mongoDB
module.exports = mongoose.model('Product', productSchema);
/*const mongoDB = require('mongodb');
const getDB = require('../util/database').getDB;

module.exports = class Product {

    constructor(id, userId, title, imgUrl, price, description) {
        this._id = id ? new mongoDB.ObjectID(id) : null;
        this.title = title;
        this.imgUrl = imgUrl;
        this.price = price;
        this.description = description;
        this.userId = userId;
    }

    save() {
        const db = getDB();
        let dbOperation;

        if ( this._id ) {
            dbOperation = db.collection('products').updateOne({ _id: this._id }, { $set: this });// $set is used to edit existing object // also possible to edit specific object property like {$set: {title: this.title}}
        } else {
            dbOperation = db.collection('products').insertOne(this)//if this collection doent exist then it will be created
        }
        return dbOperation
            .then(result => {
                return result;
            }).catch(err => {
                console.log(err);
            });

    }

    static fetchAll(callback) { //Static method can only be called directly using class name and not using class instance
        const db = getDB();
        return db.collection('products').find()// to get all the products without any filter
            .toArray()//to iterate the cursor and return the documents in an array
            .then( products => {
                return products;//need to return or else it will not go to the next then block
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDB();
        return db.collection('products').find({ _id: new mongoDB.ObjectID(productId) })// to get a product filter by _id// we need to convert it to mongo Db id format
            .next()//As you iterate through the cursor and reach the end of the returned batch, if there are more results, cursor.next() will perform a getMore operation to retrieve the next batch.
            .then( product => {
                return product;
            })
            .catch(err => console.log(err));
    }

    static deleteById(productId) {
        const db = getDB();

        return db.collection('products').deleteOne({ _id: new mongoDB.ObjectID(productId) })
            .then( products => {
                console.log('Deleted');
            })
            .catch(err => console.log(err));
    }
};*/