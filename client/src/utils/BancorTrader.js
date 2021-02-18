import Web3 from 'web3'
import axios from 'axios';
import { collateralRopsten, collateralMainnet } from './constants.js';
const Decimal = require('decimal.js');
Decimal.set({ toExpPos: 50 });
const ContractRegistryABI = require('../contracts/ContractRegistry.json');
const BancorNetworkABI =  require('../contracts/BancorNetwork.json');
const ERC20ABI = require('../contracts/ERC20Token.json');
const ConverterRegistryAbi = require('../contracts/ConverterRegistry.json');
const LiquidityPoolConverter = require('../contracts/LiquidityPoolV1Converter.json');

const CURRENT_NETWORK = Number(process.env.REACT_APP_NETWORK_ID);

let BNT_ADDRESS = process.env.REACT_APP_BNT_TOKEN_MAINNET;
let CurrentCollateralList = collateralMainnet;
let RPC_URL = process.env.REACT_APP_MAINNET_PROVIDER_URL;
let contractRegistryAddress = process.env.REACT_APP_CONTRACT_REGISTRY_MAINNET;

if (CURRENT_NETWORK === 3) {
  BNT_ADDRESS = process.env.REACT_APP_BNT_TOKEN_ROPSTEN;
  CurrentCollateralList = collateralRopsten;  
  RPC_URL = process.env.REACT_APP_ROPSTEN_PROVIDER_URL;
  contractRegistryAddress = process.env.REACT_APP_CONTRACT_REGISTRY_ROPSTEN;
}

const providerWeb3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

const ContractRegistry = new providerWeb3.eth.Contract(ContractRegistryABI, contractRegistryAddress);

const TOKEN_DECIMALS = 8;

const ETH_ADDRESS = providerWeb3.utils.toChecksumAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");


const getPriceTOKENUSD = (tokenSymbol = 'BNT') => {
  return axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol.toUpperCase()}&tsyms=USD`).then(function(priceUSDResponse){
    return priceUSDResponse.data.USD;
  }).catch(function(err){
    return 0;
  });
}

const getBancorNetworkAddress = async() => {
    const bancorNetworkName = providerWeb3.utils.fromAscii('BancorNetwork');
    const address = await ContractRegistry.methods.addressOf(bancorNetworkName).call();
    return address;
}

const getConverterRegistryAddress = async() => {
  const converterRegistryName = providerWeb3.utils.fromAscii('BancorConverterRegistry');
  const address = await ContractRegistry.methods.addressOf(converterRegistryName).call();
  return address; 
}

export function getTokenListPrices(productList) {
  return getBancorNetworkAddress().then(function(bnAddress){
    return axios.get(`https://min-api.cryptocompare.com/data/price?fsym=BNT&tsyms=USD`).then(function(priceUSDResponse){
    const bntPriceUSD = priceUSDResponse.data.USD;
    const BancorNetworkContract = new providerWeb3.eth.Contract(BancorNetworkABI, bnAddress);
    const productListWithPrices = productList.map(function(item, idx){
      const path = [item.tokenAddress,  item.poolAddress, BNT_ADDRESS]
      return BancorNetworkContract.methods.rateByPath(path, 100000000).call().then(function(response){
      const priceBNT = parseFloat(providerWeb3.utils.fromWei(response)).toFixed(2);
      const priceItemUSD = Number(priceBNT) * Number(bntPriceUSD)
        return Object.assign({}, item, {'priceBNT': priceBNT, 'priceUSD': priceItemUSD.toFixed(2)})
      });
    });
    return Promise.all(productListWithPrices).then(function(priceResponse){
      return priceResponse;
    })
    });
  });
}


export function buyProductERC20Token(item, selectedCollateralToken, amount = 1) {
  const windowWeb3 = window.web3;
  const currentProvider = windowWeb3.currentProvider;
  const userWeb3 = new Web3(currentProvider);
  const walletAddress = userWeb3.currentProvider.selectedAddress;
  return getBancorNetworkAddress().then(function(bnAddress){
    const BancorNetworkContract = new userWeb3.eth.Contract(BancorNetworkABI, bnAddress);
    const TokenContract = new userWeb3.eth.Contract(ERC20ABI, selectedCollateralToken.address);
    let isEth = false;
    if (selectedCollateralToken.symbol.toLowerCase() === 'eth') {
      isEth = true;
    }
    const amountWeiDecimals = new Decimal(amount).mul(Decimal.pow(10, selectedCollateralToken.decimals))
    const amountWei = amountWeiDecimals.toString()
    return getPathWithBNT(item, selectedCollateralToken).then(function(path){
      const tokenValue = isEth ? amountWei : 0
      return getApprovalBasedOnAllowance(TokenContract, bnAddress, amountWei, isEth).then(function(response){
        return BancorNetworkContract.methods.convertByPath(
          path,
          amountWei,
          1,
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000', 
          0
        ).send({
        from: walletAddress,
        value: tokenValue,
        }).then(function(buyResponse){
          return buyResponse;
        }).catch(function(err){
          throw err;
        })
      });
    });
    }).catch(function(err){
      throw err;
    })
}

export function sellProductERC20Token(item, selectedCollateralToken, amount = 1) {
  const windowWeb3 = window.web3;
  const currentProvider = windowWeb3.currentProvider;
  const userWeb3 = new Web3(currentProvider);
  const walletAddress = userWeb3.currentProvider.selectedAddress;
  
  return getBancorNetworkAddress().then(function(bnAddress){
    const BancorNetworkContract = new userWeb3.eth.Contract(BancorNetworkABI, bnAddress);
    const TOKEN_ADDRESS = item.tokenAddress;
    const TokenContract = new userWeb3.eth.Contract(ERC20ABI, TOKEN_ADDRESS)
    const amountWei = Decimal(amount).mul(Decimal.pow(10, 8)).toString();
    return getApprovalBasedOnAllowance(TokenContract, bnAddress, amountWei, false).then(function(response){
    return getPathWithBNT(item, selectedCollateralToken).then(function(reversePath){

    let path = reversePath.reverse();
    return BancorNetworkContract.methods.convertByPath(
        path,
        amountWei,
        1,
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000', 
        0
      ).send({
      from: walletAddress,
      value: 0,
      }).then(function(sellResponse){
        return
      })
    });
    
    });
    })  
}

export function getBuyReturnPrice(item, collateral, amount = 1) {
  let conversionPath = [];
  console.log(BNT_ADDRESS);
  const BNT_DATA = CurrentCollateralList.find((c) => (c.address.toLowerCase() === BNT_ADDRESS.toLowerCase()));
  const itemData = {
    'address': item.tokenAddress,
    'bntAnchor': item.poolAddress,
    'decimals': TOKEN_DECIMALS
  }
  if (collateral.symbol.toLowerCase() === 'bnt') {
    conversionPath = [[collateral, item.poolAddress, itemData]];
  } else {
    const collateralData = CurrentCollateralList.find((c) => (c.address === collateral.address));
    conversionPath = [
     [collateral, collateralData.bntAnchor, BNT_DATA],
     [BNT_DATA, item.poolAddress, itemData]
    ]
  }
  const amountWei = new Decimal(amount).mul(Decimal.pow(10, TOKEN_DECIMALS)).toString()
  return getAmountsIn(amountWei, conversionPath).then(function(priceInCollateral){
    return getPriceTOKENUSD(collateral.symbol).then(function(collateralPriceUSD){
      const priceTokenValue = Number(priceInCollateral);
      return {'priceToken': priceTokenValue, 'priceUSD': collateralPriceUSD * priceTokenValue};
    }) 
  })
}

export function getSellReturnPrice(item, collateral, amount = 1) {
   return getBancorNetworkAddress().then(function(bnAddress){
    const BancorNetworkContract = new providerWeb3.eth.Contract(BancorNetworkABI, bnAddress);
    const amountWei = parseInt(amount * Math.pow(10, 8))
    return getPathWithBNT(item, collateral).then(function(reversePath){
    let path = reversePath.reverse()

    return BancorNetworkContract.methods.rateByPath(path, amountWei).call().then(function(amountResponse){
      const priceToken = new Decimal(amountResponse).div(Decimal.pow(10, collateral.decimals)).toFixed(4, Decimal.ROUND_DOWN)
      return getPriceTOKENUSD(collateral.symbol).then(function(tokenPriceUSD){
        const priceUSD = Number(priceToken) * tokenPriceUSD
        return {'priceToken': Number(priceToken), 'priceUSD': priceUSD};
      });
    });
    
    });
  }); 
}
  


export function getApprovalForBancorNetwork(collateralAddress, amount) {
   const windowWeb3 = window.web3;
   const userWeb3 = new Web3(windowWeb3.currentProvider);
   return getBancorNetworkAddress().then(function(bnAddress){
    const Contract = new userWeb3.eth.Contract(ERC20ABI, collateralAddress);
    let isEth = false;
    if (collateralAddress.toLowerCase() === ETH_ADDRESS.toLowerCase()) {
      isEth = true;
    }
    return getApprovalBasedOnAllowance(Contract, bnAddress, amount, isEth).then(function(approvalResponse){
      return approvalResponse;
    })
  });
} 

function getApprovalBasedOnAllowance(contract, spender, amount, isEth) {
  const windowWeb3 = window.web3;
  const userWeb3 = new Web3(windowWeb3.currentProvider);
  const owner = userWeb3.currentProvider.selectedAddress;
  let maxAmount = userWeb3.utils.toWei('1000000000000');
  if (isEth) {
    return new Promise((resolve)=>(resolve(maxAmount)))
  } else {
    return contract.methods.decimals().call().then(function(amountDecimals){
      return contract.methods.allowance(owner, spender).call().then(function(allowance) {
        if (!allowance || typeof allowance === undefined) {
          allowance = 0;
        }
        let minAmount = amount;
        let minAllowance = allowance;
        const amountAllowed = new Decimal(minAllowance);
        const amountNeeded = new Decimal(minAmount);
        if (amountAllowed.greaterThan(amountNeeded)) {
          return new Promise((resolve, reject)=>(resolve(null)));
        } else {
          maxAmount = new Decimal('10000000').mul(Decimal.pow(10, amountDecimals)).toString()
          return contract.methods.approve(userWeb3.utils.toChecksumAddress(spender), maxAmount).send({
            from: owner
          }).then(function(approveResetResponse){   
            return approveResetResponse;
          });
        }
      });
    });
  }
}

function getPathWithBNT(item, collateralToken) {
  if (collateralToken.address.toLowerCase() === BNT_ADDRESS.toLowerCase()) {
    return new Promise((resolve) => (resolve([BNT_ADDRESS, item.poolAddress, item.tokenAddress])))
  } else {
    // TODO replace the collateral.bntAnchor hardcode with dynamically calculated bntAnchor between Collateral and BNT
    const path = [collateralToken.address, collateralToken.bntAnchor, BNT_ADDRESS, item.poolAddress, item.tokenAddress]
    return new Promise((resolve) => (resolve(path)))
  }
}

async function getAmountsIn(amountRequired, path) {
  for (let i = path.length - 1; i >= 0; i --) {
    const poolDataAmount = await getAmountInForReserve(amountRequired, path[i])
    amountRequired = poolDataAmount;
  }
  const amountRequiredValue = new Decimal(amountRequired).div(Decimal.pow(10, path[0][0].decimals));
  return amountRequiredValue.toFixed(4, Decimal.ROUND_UP);
}

async function getAmountInForReserve(amountOut, currentPath) {
  const pathPoolToken = currentPath[1];
  const ConverterRegistryAddress = await getConverterRegistryAddress() 
  const ConverterRegistryContract = new providerWeb3.eth.Contract(ConverterRegistryAbi, ConverterRegistryAddress);
  const poolConverterAddressList = await ConverterRegistryContract.methods.getConvertersByAnchors([pathPoolToken]).call();
  const PathConverterContract = new providerWeb3.eth.Contract(LiquidityPoolConverter, poolConverterAddressList[0]);
  const reserveOneBalance = await PathConverterContract.methods.reserveBalance(currentPath[0].address).call();
  const reserveTwoBalance = await PathConverterContract.methods.reserveBalance(currentPath[2].address).call();
  let PoolFee = await PathConverterContract.methods.conversionFee().call();
  PoolFee = Number(PoolFee) / 10000
  const reserveIn = new Decimal(reserveOneBalance);
  const reserveOut = new Decimal(reserveTwoBalance);
  const denSubFee = new Decimal(1000).sub(PoolFee)
  const numerator = reserveIn.mul(amountOut).mul(1000);
  const denominator = reserveOut.sub(amountOut).mul(denSubFee);  
  const amountIn = numerator.div(denominator).add(1);
  Decimal.rounding = Decimal.ROUND_UP;
  return Decimal.round(amountIn).toString();
  
}
