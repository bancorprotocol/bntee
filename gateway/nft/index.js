var Order = require('../schema/order');
var Opensea = require('../models/Opensea');

module.exports = {
  createNFTSaleForPreviousOrders: function() {
    Opensea.getAssetData();
    return Order.find({}).then(function(orderList) {
      const orderNFTCreate = orderList.map(function(orderItem, idx) {
        if (!orderItem.nftLink && !orderItem.nftSaleMade) {
          const timeout = 1000;
          setTimeout(function() {
          return Opensea.createOpenSeaListing(orderItem.walletAddress, orderItem.tokenSymbol).then(function(nftSale){
            orderItem.nftLink = nftSale.openseaLink;
            orderItem.nftSaleMade = true;
            return orderItem.save({}).then(function(saveRes){
              return;
            });
          });
        }, 10000 * idx);
        }
      });
      return Promise.all(orderNFTCreate).then(function(nftPrderList){
        console.log('finished creating backdated nft orders');
        return;
      })
    });
  }
}
