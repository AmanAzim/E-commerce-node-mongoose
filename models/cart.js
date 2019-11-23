const fs = require('fs');
const path = require('path');

const filePath = path.join(
    path.dirname(process.mainModule.filename), //In the root directory
    'data', //in the data folder
    'cart.json', //create a file name "product.json" and save data in json format
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
      fs.readFile(filePath, (err, fileContent) => {
         let cart = {
             products: [],
             totalPrice: 0,
         };

         if ( !err ) {
            cart = JSON.parse(fileContent);//Fetch the previous cart
         }

         const existingProductIndex = cart.products.findIndex( product => product.id === id );
         const existingProduct = cart.products[existingProductIndex];

         let updatedProduct;

         if ( existingProduct ) { //If we have the product already in the array/cart then we just increase the questity

             updatedProduct = {...existingProduct};
             updatedProduct.quentity = updatedProduct.quentity + 1;

             cart.products = [...cart.products];
             cart.products[existingProductIndex] = updatedProduct;

         } else {
             updatedProduct = { id: id, quentity: 1 };
             cart.products = [...cart.products, updatedProduct];
         }

         cart.totalPrice = cart.totalPrice + parseFloat(productPrice);

         fs.writeFile(filePath, JSON.stringify(cart), (err) => {
             console.log(err);
         });
      });
  }

  static deleteProductFromCart(id, price) {
      fs.readFile(filePath, (err, fileContent) => {
          if (err) {
              return;
          }

          const existingCart = { ...JSON.parse(fileContent) };
          const product = existingCart.products.find( product => product.id === id );
          if ( !product ) {
              return;
          }
          const productQuentity = product.quentity;

          existingCart.products = existingCart.products.filter( product => product.id !== id );
          existingCart.totalPrice = existingCart.totalPrice - price * productQuentity;

          fs.writeFile(filePath, JSON.stringify(existingCart), (err) => {
              console.log(err);
          });
      });
  }

  static getCart(callback) {
      fs.readFile(filePath, (err, fileContent) => {
          if ( !err ) {
              callback(JSON.parse(fileContent));
          } else {
              callback([]);
          }
      });
  }
};