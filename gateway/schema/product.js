const {getDBConnectionString} = require('./common');


const mongoose = getDBConnectionString()

var product = new mongoose.Schema({
     productName: String,
     tokenAddress: String,
     tokenSymbol: String,
     poolAddress: String,
     converterAddress: String,
     productFrontImageSmall: String,
     productFrontImageLarge: String,     
     productBackImageSmall: String,
     productBackImageLarge: String,  
     isDisabled: {type: Boolean, default: false}
   });
  
var Product = mongoose.model('product', product);

module.exports = Product;
