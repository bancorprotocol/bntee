var Web3 = require('web3');
const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;

var Product = require('../schema/product');
var Order = require('../schema/order');

const PRIVATE_KEY = process.env.APP_DEPLOYER_PRIVATE_KEY
const PROVIDER_URL = process.env.APP_RINKEBY_PROVIDER_URL;

var HDWalletProvider = require("truffle-hdwallet-provider");

const WalletProvider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_URL);

const OWNER_ADDRESS = process.env.APP_DEPLOYER_ADDRESS;

let openseaObject;



export async function createOpenSeaListing(buyerAddress, type) {
    const productData = await Product.findOne({'tokenSymbol': type});
    const productNFTAddress = productData.nftAddress;
    const productNFTId = productData.nftId;
    const seaport = getSeaNetwork();
    const listing = await seaport.createSellOrder({
    asset: {
      tokenAddress: productNFTAddress,
      tokenId: productNFTId, 
      schemaName: "ERC1155"
    },
    accountAddress: OWNER_ADDRESS,
    startAmount: 0,
    buyerAddress,
  }).catch((error) => {
    console.log(error);
    return;
  });
  const openseaLink = listing.asset.openseaLink;
  const nftImagePreview = listing.asset.imagePreviewUrl;
  return Order.findOne({'walletAddress': buyerAddress}).then(function(orderResponse){
    orderResponse.nftClaimed = true;
    orderResponse.nftLink = openseaLink;
    return orderResponse.save({}).then(function(saveRes){
      return {'openseaLink': openseaLink, 'nftImagePreview': nftImagePreview};  
    });
  });
} 

function getSeaNetwork() {
let openSeaNetwork = Network.Main;
if (parseInt(process.env.APP_NETWORK_ID) === 3) {
  openSeaNetwork = Network.Rinkeby;
} 
console.log(openSeaNetwork);

  if (openseaObject) {
    return openseaObject;
  } else {
    const seaport = new OpenSeaPort(WalletProvider, {
      networkName: openSeaNetwork
    });
    openseaObject = seaport;
    return openseaObject;
  }
}