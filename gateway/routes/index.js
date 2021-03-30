
require('dotenv').config();
var express = require('express');
var router = express.Router();
var Product = require('../schema/product');
var Order = require('../schema/order');
const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env.SLIMBOT_API_KEY);
const ChainUtils = require('../utils/ChainUtils');
const OpenSea = require('../models/Opensea');
const Nftsale = require('../nft/index');

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

router.get('/create_nft_sale', function(req, res){
  const auth = req.query.auth;
  if (auth === process.env.APP_SECRET) {
    Nftsale.createNFTSaleForPreviousOrders();
    res.send({'message': 'success'});
  } else {
    res.send(400, {'message': 'unauthorized'});
  }
});

router.get('/reset_nft_listing', function(req, res){
  const auth = req.query.auth;
  const token = req.query.token;
  if (auth === process.env.APP_SECRET) {
    Order.find({}).then(function(orderList){
      orderList.forEach(function(orderItem){
        if (token) {
          if (orderItem.tokenSymbol === token) {
            orderItem.nftLink = '';
            orderItem.nftSaleMade = false;
            orderItem.nftClaimed = false;
            orderItem.save({});
          }
        } else {
          orderItem.nftLink = '';
          orderItem.nftSaleMade = false;
          orderItem.nftClaimed = false;
          orderItem.save({});
        }
      })
    })
    res.send({'message': 'success'});
  } else {
    res.send(400, {'message': 'unauthorized'});
  }
});

router.get('/product_order_details', function(req, res){
  const auth = req.query.auth;
  if (auth === process.env.APP_SECRET) {
    OpenSea.getAssetData().then(function(assetResponse){
      res.send({'message': 'success', 'data': assetResponse});
    });
  } else {
    res.send(400, {'message': 'unauthorized'});
  }
});

router.get('/user_nft_claims', function(req, res){
  const userWallet = req.query.address;
  Order.find({$or: [{'walletAddress': userWallet} , {'walletAddress': userWallet.toLowerCase()}]
   }).then(function(orderResponseList){
    const nftLinkList = [];
    orderResponseList.forEach(function(orderResponse){
      if (orderResponse.nftLink && orderResponse.nftSaleMade) {
        nftLinkList.push({'token': orderResponse.tokenSymbol, 'link': orderResponse.nftLink});
      }
    });
    res.send(nftLinkList);
  }).catch(function(err){
    res.send(500, err);
  });
});

router.get('/create_nft_claim', function(req, res){
  const auth = req.query.auth;
  const address = req.query.address;
  const token = req.query.token;
  const orderId = req.query.orderId;
  if (auth === process.env.APP_SECRET) {
    OpenSea.createOpenSeaListing(address, token, orderId).then(function(assetResponse){
      res.send({'message': 'success', 'data': assetResponse});
    });
  } else {
    res.send(400, {'message': 'unauthorized'});
  }
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
      productResponse.nftId = product.nftId;
      productResponse.nftAddress = product.nftAddress;
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

    if (!userClaimResponse || !userClaimResponse.valid) {
      res.send(400, {'message': 'failure', 'data': 'Invalid user claim'})
    } else {
      orderData.status = 'pending';
      orderData.transactionHash = userClaimResponse.transactionHash;
      const APP_HOST_URL = process.env.APP_HOST_URL;
      orderData.timeStamp = new Date();
      const newRequest = `New product claim received\n
      Product Name- ${orderData.productName}\n
      Size- ${orderData.shirtSize}\n
      Full Name- ${orderData.fullName}\n
      Email- ${orderData.email}\n
      Street Address- ${orderData.streetAddress}\n
      City- ${orderData.city}\n
      State- ${orderData.state}\n
      ZipCode- ${orderData.zipCode}\n
      Country- ${orderData.country}\n
      Transaction Hash- ${orderData.transactionHash ? orderData.transactionHash : ''}\n
      Fulfill order here- https://printify.com/app/store/products\n
      After you are done mark order status as completed here-
      ${APP_HOST_URL}/admin`;

      slimbot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, newRequest);
      orderData.walletAddress = orderData.walletAddress ? orderData.walletAddress.toLowerCase() : '';
      const order = new Order(orderData);
      order.save({}).then(function(saveResponse){
        const walletAddress = orderData.walletAddress.toLowerCase();
        const productType = orderData.tokenSymbol;
        const orderId = saveResponse._id;
        OpenSea.createOpenSeaListing(walletAddress, productType, orderId).then(function(openseaResponse){
          let payload = {'message': 'success'};
          if (openseaResponse) {
            payload.openseaLink = openseaResponse.openseaLink;
            payload.nftImagePreview = openseaResponse.nftImagePreview;
          }
          res.send(payload);
        })
      });
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
