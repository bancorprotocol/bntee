var Web3 = require('web3');
require('dotenv').config();

const ERC20Burnable = require('./ERC20Burnable.json');

const CURRENT_NETWORK = Number(process.env.APP_NETWORK_ID);
let RPC_URL = process.env.APP_MAINNET_PROVIDER_URL;
if (CURRENT_NETWORK === 3) {
  RPC_URL = process.env.APP_ROPSTEN_PROVIDER_URL;
}
var Decimal = require('decimal.js');
const Order = require('../schema/order');
const web3 = new Web3(RPC_URL);

module.exports = {
  verifyUserClaim: function(orderData) {
    const userWalletAddress = orderData.walletAddress;
    const BurnableToken = new web3.eth.Contract(ERC20Burnable, web3.utils.toChecksumAddress(orderData.tokenAddress));
    return BurnableToken.getPastEvents('Transfer', {
      filter: {to: '0x0000000000000000000000000000000000000000'}, 
      fromBlock: 0,
      toBlock: 'latest'
    }).then(function(events){
      const eventFormattedData = events.map(function(eItem){
        if (eItem.returnValues && Object.keys(eItem.returnValues).length > 0) {
          return {'from': eItem.returnValues[0], 'value': eItem.returnValues.value, 'transaction_hash': eItem.transactionHash}
        } else {
          return null;
        }
      }).filter(Boolean);

      let totalTokensBurnt = 0;

      if (eventFormattedData) {
        eventFormattedData.forEach(function(log){
          if (log.from.toLowerCase() === userWalletAddress.toLowerCase()) {
            totalTokensBurnt += Number(log.value)/Math.pow(10, 8);
          }
        });
      }
      return Order.find({'walletAddress': userWalletAddress.toLowerCase(), 'tokenAddress': orderData.tokenAddress.toLowerCase()}).then(function(redemptionData){
        if (totalTokensBurnt > redemptionData.length) {
          const orderTxHash = getTransactionHashForOrder(redemptionData, orderData, eventFormattedData, userWalletAddress);
          return {'valid': true, 'transactionHash': orderTxHash};
        } else {
          return {'valid': false, 'transactionHash': ''};
        }
      });
  });   
  
  }
}

function getTransactionHashForOrder(orders, orderData, eventFormattedData, userWalletAddress) {
  if (orderData.transactionHash) {
    return orderData.transactionHash.toLowerCase();
  } else {
    let orderTxHashMapping = ''
    eventFormattedData.forEach(function(log){
      if (log.from.toLowerCase() === userWalletAddress.toLowerCase()) {
        const totalTokensBurnt = Number(log.value)/Math.pow(10, 8);
        let numOrdersWithSameHash = 0;
        if (orders.length > 0) {
          numOrdersWithSameHash = orders.filter(function(order){
            if (order.transactionHash &&
               log.transaction_hash &&
               order.transactionHash.toLowerCase() === log.transaction_hash.toLowerCase()
            ) {
              return order;
            }
          }).length;
        }
        if (numOrdersWithSameHash < totalTokensBurnt) {
          orderTxHashMapping = log.transaction_hash.toLowerCase();
        }
      }    
    });
    return orderTxHashMapping;
  }
}