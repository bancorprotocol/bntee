require('dotenv').config();
var express = require('express');
var router = express.Router();
var Product = require('../schema/product');
var Order = require('../schema/order');
const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env.SLIMBOT_API_KEY);
const ChainUtils = require('../utils/ChainUtils');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', function(req, res){
  Product.find({}).then(function(productList){
    const responseList = productList.filter(function(p){
      return !p.isDisabled;
    })
    res.send({'message': 'success', 'products': responseList});
  })
})

router.get('/admin_products', function(req, res){
  Product.find({}).then(function(productList){
    res.send({'message': 'success', 'products': productList});
  })  
});

router.get('/product', function(req, res){
  const productID = req.query.id;
  Product.findOne({'_id': productID.toString()}).then(function(product){
    res.send({'message': 'success', 'product': product});
  });
});

router.put('/product', function(req, res){
  const auth_token = req.headers.token;
  
  const {product} = req.body;
  
  if (auth_token.trim() !== process.env.APP_SECRET) {
    res.send(400, {'message': 'unauthorized'});
  } else {
    Product.findOne({'_id': product._id.toString()}).then(function(productResponse){
      productResponse.productName = product.productName;
      productResponse.tokenAddress = product.tokenAddress;
      productResponse.tokenSymbol = product.tokenSymbol;
      productResponse.poolAddress = product.poolAddress;
      productResponse.converterAddress = product.converterAddress;
      productResponse.productFrontImageSmall = product.productFrontImageSmall;
      productResponse.productFrontImageLarge = product.productFrontImageLarge;
      productResponse.productBackImageSmall = product.productBackImageSmall;
      productResponse.productBackImageLarge = product.productBackImageLarge; 
      productResponse.isDisabled = product.isDisabled;
      productResponse.save({}).then(function(saveResponse){
        res.send({'message': 'success'});  
      })
    });
  }
})

router.post(`/product`, function(req, res){
  const auth_token = req.headers.token;
  
  var product = new Product(req.body);
  if (auth_token.trim() !== process.env.APP_SECRET) {
    res.send(400, {'message': 'unauthorized'});
  } else {
    product.save({}).then(function(saveResponse){
      res.send({'message': 'success'}); 
    });
  }
});

router.post('/submit_claim', function(req, res){
  let orderData = req.body;
  ChainUtils.verifyUserClaim(orderData).then(function(userClaimResponse){
    
    if (!userClaimResponse) {
      res.send(400, {'message': 'failure', 'data': 'Invalid user claim'})
    } else {
      orderData.status = 'pending';
      const APP_HOST_URL = process.env.APP_HOST_URL;  
      orderData.timeStamp = new Date();
      const newRequest = `New product claim received\n
      Product Name- ${orderData.productName}\n
      Size- ${orderData.shirtSize}\n
      Full Name- ${orderData.fullName}\n
      Email- ${orderData.email}\n
      Street Address- ${orderData.streetAddress}\n
      City- ${orderData.city}\n
      ZipCode- ${orderData.zipCode}\n
      Country- ${orderData.country}\n
      Fulfill order here- https://printify.com/app/store/products\n
      After you are done mark order status as completed here- 
      ${APP_HOST_URL}/admin`;
    
      slimbot.sendMessage('-1001340647345', newRequest);
      
      const order = new Order(orderData);
      order.save({}).then(function(saveResponse){
        res.send({'message': 'success'});
      })
    }
  });
})

router.get('/orders', function(req, res){
  Order.find({}).then(function(orderResponse){
    res.send({'message': 'success', 'orders': orderResponse});
  })
});


router.post('/login', function(req, res){
  const savedUsername = process.env.ADMIN_APP_USERNAME;
  const savedPassword = process.env.ADMIN_APP_PASSWORD;
  const {username, password} = req.body;
  const token = process.env.APP_SECRET;
  if (username == savedUsername && password === savedPassword) {
    res.send({'message': 'success', 'token': token})
  } else {
    res.send(401, {'message': 'failure'})
  }
});

router.get('/authorize', function(req, res){
  const token = req.headers.token;
  
  res.send({'message': 'success'});
})

router.get('/claims', function(req, res){
  const address = req.query.address;
  Order.find({'walletAddress': address.toLowerCase()}).then(function(response){
    res.send({'claims': response});
  })
})

router.post('/set_status', function(req, res){
  const {orderList} = req.body;
  let {status} = req.query;
  const token = req.headers.token;
  
  if (!status) {
    status = 'completed';
  }
  const orderListStatusResponse = orderList.map(function(orderItem){
    return Order.findOne({'_id': orderItem._id.toString()}).then(function(orderData){
      if (orderData) {
        orderData.status = status;
        return orderData.save({}).then(function(saveRes){
          return saveRes;
        }).catch(function(err){
          return null;
        });
        } else {
          return null;
        }
    })
  });
  
  Promise.all(orderListStatusResponse).then(function(listRes){
    res.send({'message': 'success'});
  })
  
})

module.exports = router;
