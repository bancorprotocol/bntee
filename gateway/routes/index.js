
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
const axios = require('axios');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', function(req, res){
  Product.find({}).then(function(productList){
    const responseProductList = productList.filter(function(p){
      return !p.isDisabled;
    });
    res.send({'message': 'success', 'products': responseProductList});
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
    console.log(product.variantToSizeMap);
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
      productResponse.fulfillmentProductId = product.fulfillmentProductId;
      productResponse.variantToSizeMap = JSON.parse(product.variantToSizeMap);
      productResponse.save({}).then(function(saveResponse){
        res.send({'message': 'success'});
      })
    });
  }
})

router.post(`/product`, function(req, res){
  const auth_token = req.headers.token;
  let reqBody = req.body;
  reqBody.variantToSizeMap = JSON.parse(reqBody.variantToSizeMap);
  console.log(reqBody);
  var product = new Product(reqBody);

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
      const order = new Order(orderData);
      order.save({}).then(function(saveResponse){
        const walletAddress = orderData.walletAddress.toLowerCase();
        const productType = orderData.tokenSymbol;
        const orderId = saveResponse._id;
        orderData.status = 'pending';
        orderData.transactionHash = userClaimResponse.transactionHash;
        const APP_HOST_URL = process.env.APP_HOST_URL;
        const fulfillmentURI = `${APP_HOST_URL}/admin/fulfill/${orderId}`
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
        Fulfill order here- ${fulfillmentURI}\n`;
        slimbot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, newRequest);
        orderData.walletAddress = orderData.walletAddress ? orderData.walletAddress.toLowerCase() : '';
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
  });
});

router.get('/submit_fulfill_order', function(req, res){
  const orderId = req.query.orderId;
  const auth = req.query.auth;
  if (auth === process.env.FULFILLMENT_AUTH) {
    Order.findOne({'_id': orderId}).then(function(orderResponse){
      Product.findOne({'tokenSymbol': orderResponse.tokenSymbol}).then(function(productResponse){
      const fulfillmentProductId = productResponse.fulfillmentProductId;
        axios.get(`https://api.printify.com/v1/shops//products/${fulfillmentProductId}.json`).then(function(printerReponse){
          const productData = printerReponse.data;
          const orderSize = orderResponse.shirtSize.toUpperCase().trim();
          const variantTitle = `${orderSize} / Black / 6 oz.`;
          const variant = productData.variants.find((v) => (v.title === variantTitle));

        });
      });
    })
  } else {
    res.send(400, {message: 'failure'});
  }
});

router.get(`/fulfillment_order_details`, function(req, res){
  const auth_token = req.headers.token;
  const {orderId} = req.query;
  const SHOP_ID = process.env.SHOP_ID;
  if (auth_token.trim() !== process.env.APP_SECRET) {
    res.send(400, {'message': 'unauthorized'});
  } else {
    Order.findOne({'_id': orderId}).then(function(orderResponse){
      Product.findOne({'tokenSymbol': orderResponse.tokenSymbol}).then(function(productResponse){
        const fulfillmentProductId = productResponse.fulfillmentProductId;
        const FULFILLMENT_URL = `https://api.printify.com/v1/shops/${SHOP_ID}/products/${fulfillmentProductId}.json`;
        const SHOP_TOKEN = process.env.PRINTIFY_API_KEY;
        const HEADER = {'headers': {'Authorization': `Bearer ${SHOP_TOKEN}`}};
        axios.get(FULFILLMENT_URL, HEADER).then(function(printerReponse){
          const printerReponseData = printerReponse.data;
          const orderSize = orderResponse.shirtSize.toUpperCase().trim();
          const productMap = JSON.parse(productResponse.variantToSizeMap);
          console.log(productMap);
          const variantTitle = `${orderSize} / Black / 6 oz.`;
          const variant = printerReponseData.variants.find((v) => (v.title === variantTitle));
          const payload = {
            product: productResponse,
            order: orderResponse,
            fulfillment: printerReponseData,
            variant: variant
          };
          res.send(payload);
        });
      });
    }).catch(function(err){
      res.send(500, err);
    })
  }
});

router.post('/fulfill_order', function(req, res){
  const payload = req.body.payload;
  const orderId = req.query.orderId;
  const auth_token = req.headers.token;
  const SHOP_ID = process.env.SHOP_ID;
  if (auth_token.trim() !== process.env.APP_SECRET) {
    res.send(400, {'message': 'unauthorized'});
  } else {
    Order.findById(orderId.toString()).then(function(orderData){
      if (orderData.status === 'pending') {
        console.log(payload);
        const FULFILLMENT_URL = `https://api.printify.com/v1/shops/${SHOP_ID}/orders.json`;
        const SHOP_TOKEN = process.env.PRINTIFY_API_KEY;
        const HEADER = {'headers': {'Authorization': `Bearer ${SHOP_TOKEN}`}};
        axios.post(FULFILLMENT_URL, payload, HEADER).then(function(orderFulfillResponse){
          const orderFulfillResponseData = orderFulfillResponse.data;
          console.log(orderFulfillResponseData);
          const orderId = orderFulfillResponseData.id;
          const OrderProductionURI = `https://api.printify.com/v1/shops/${SHOP_ID}/orders/${orderId}/send_to_production.json`;
          axios.post(OrderProductionURI, HEADER).then(function(productionResponse){
            orderData.status = 'completed';
            orderData.save({}).then(function(response){
              res.send({'message': 'success'});
            });
          });
        }).catch(function(err){
            console.log(err.response);
            res.send(500, err);
        })
      } else {
        res.send(500, {'err': 'order already fulfilled'});
      }
    })
  }
})

module.exports = router;
