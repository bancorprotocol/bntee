import Web3 from 'web3'
const ERC20Burnable = require('../contracts/ERC20Burnable');

const Decimal = require('decimal.js');

const CURRENT_NETWORK = Number(process.env.REACT_APP_NETWORK_ID);

let RPC_URL = process.env.REACT_APP_MAINNET_PROVIDER_URL;
let BNT_ADDRESS = process.env.REACT_APP_BNT_TOKEN_MAINNET;
if (CURRENT_NETWORK === 3) {
  RPC_URL = process.env.REACT_APP_ROPSTEN_PROVIDER_URL;
  BNT_ADDRESS = process.env.REACT_APP_BNT_TOKEN_ROPSTEN;  
}

const providerWeb3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

export function redeemProductERC20Token(web3, product, amount) {
  const BurnableToken = new web3.eth.Contract(ERC20Burnable, product.tokenAddress);
  const amountWei = Number(amount) * Math.pow(10, 8);
  const walletAddress =  web3.currentProvider.selectedAddress;
  return BurnableToken.methods.burn(amountWei).send({from: walletAddress}).then(function(burnResponse){
    return burnResponse;
  })
}

export function getWalletBalance(productsList) {
  const windowWeb3 = window.web3;
  const userWeb3 = new Web3(windowWeb3.currentProvider);
  const selectedAddress = userWeb3.currentProvider.selectedAddress;
  const productListBalance = productsList.map(function(productItem){
    const BurnableToken = new providerWeb3.eth.Contract(ERC20Burnable, productItem.tokenAddress);
    return BurnableToken.methods.balanceOf(selectedAddress).call().then(function(balanceResponse){
      const walletBalance = new Decimal(balanceResponse).div(Decimal.pow(10, 8)).toNumber()
      return Object.assign({}, productItem, {userBalance: walletBalance})
    })
  });
  return Promise.all(productListBalance).then(function(balanceResponse){
    return balanceResponse;
  })
  
}
export function getPastEventsFromWallet(productsList) {
  const productListEvents = productsList.map(function(productItem, pIdx){
    return getPastEvents(productItem).then(function(response){
      return response;
    });
  });
  return Promise.all(productListEvents).then(function(response){
    return response;
  })
    
}

function getPastEvents(product) {
  const BurnableToken = new providerWeb3.eth.Contract(ERC20Burnable, product.tokenAddress);
  return BurnableToken.getPastEvents('Transfer', {
      filter: {to: '0x0000000000000000000000000000000000000000'}, 
      fromBlock: 0,
      toBlock: 'latest'
  })
  .then(function(events){
    return BurnableToken.methods.totalSupply().call().then(function(totalSupplyVal){
      const totalSupply = Number(totalSupplyVal)/Math.pow(10, 8);
      const eventFormattedData = events.map(function(eItem){
        if (eItem.returnValues && Object.keys(eItem.returnValues).length > 0) {
          return {'from': eItem.returnValues[0], 'value': eItem.returnValues.value, 'transaction_hash': eItem.transactionHash}
        } else {
          return null;
        }
      }).filter(Boolean);
      return Object.assign({}, product, {'totalSupply': totalSupply}, {'logs': eventFormattedData});
  });   
  
  });
}