
const Decimal = require('decimal.js');
const ERC20Abi = require('../contracts/ERC20Token.json');

export function getUserBalance(web3, collateral) {
  const selectedAddress = web3.currentProvider.selectedAddress;
  if (collateral.symbol.toLowerCase() === 'eth') {
    return web3.eth.getBalance(selectedAddress).then(function(ethBalance){
      const balanceDecimals = new Decimal(ethBalance);
      return balanceDecimals.div(Decimal.pow(10, collateral.decimals)).toFixed(2, Decimal.ROUND_DOWN); 
    })
  } else {
    const ERC20Contract = new web3.eth.Contract(ERC20Abi, collateral.address);
    return ERC20Contract.methods.balanceOf(selectedAddress).call().then(function(balanceResponse){
      const balanceDecimals = new Decimal(balanceResponse);
      return balanceDecimals.div(Decimal.pow(10, collateral.decimals)).toFixed(2, Decimal.ROUND_DOWN);
    })
  }
}