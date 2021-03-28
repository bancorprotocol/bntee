import {GET_PRODUCT_LIST, GET_PRODUCT_LIST_SUCCESS, GET_PRODUCT_LIST_FAILURE,
  GET_META_SUCCESS,
  GET_PRICES_SUCCESS,
  GET_PAST_EVENTS_SUCCESS,
  GET_USER_WALLET_BALANCE_SUCCESS,
  GET_USER_CLAIMS_SUCCESS,
  GET_USER_NFT_CLAIMS_SUCCESS,
} from '../actions/token';
import { isEmptyObject } from '../utils/ObjectUtils';

const initialState = {
  products: [],
  currentProduct: {},
  userClaims: [],
  userClaimsWithMeta: {},
  userNftClaims: [],
}

export default function tokenReducer (state = initialState, action) {
  let productListData = []
  let userClaimsWithMeta;
  switch (action.type) {

    case GET_PRODUCT_LIST:
      return {...state, productListFetching: true}
    case GET_PRODUCT_LIST_SUCCESS:
      const productResponse = action.payload.products;
      return {...state, products: productResponse, currentProduct: productResponse[0],
      productListFetching: false}
    case GET_PRODUCT_LIST_FAILURE:
      return {productListFetching: false}
    case GET_PRICES_SUCCESS:
      productListData = state.products;
      const productListWithPrices = action.payload;
      const unifiedListWithPrices = mergeKeys(productListData, productListWithPrices)
      return {...state, products: unifiedListWithPrices}
    case GET_PAST_EVENTS_SUCCESS:
      productListData = state.products;
      const listWithEvents = action.payload;
      const unifiedListWithEvents = mergeKeys(productListData, listWithEvents);
      userClaimsWithMeta = updateUserClaims(state.userClaims, unifiedListWithEvents)
     if (isEmptyObject(userClaimsWithMeta)) {
        userClaimsWithMeta = state.userClaimsWithMeta
      }
      return {...state, products: unifiedListWithEvents, userClaimsWithMeta: userClaimsWithMeta}
    case GET_META_SUCCESS:
      productListData = state.products;
      const listWithMeta = action.payload;
      const unifiedListWithMeta = mergeKeys(productListData, listWithMeta)
      return {...state, products: unifiedListWithMeta}
    case GET_USER_WALLET_BALANCE_SUCCESS:
      productListData = state.products;
      const listWithBalance = action.payload;
      const unifiedListWithBalance = mergeKeys(productListData, listWithBalance);
      return {...state, products: unifiedListWithBalance}
    case GET_USER_CLAIMS_SUCCESS:
      const userClaims = action.payload.claims;
      userClaimsWithMeta = updateUserClaims(userClaims, state.products)
      if (isEmptyObject(userClaimsWithMeta)) {
        userClaimsWithMeta = state.userClaimsWithMeta
      }
      return {...state, userClaims: userClaims, userClaimsWithMeta: userClaimsWithMeta}
    case GET_USER_NFT_CLAIMS_SUCCESS:
      console.log(action.payload);
      return {...state, userNftClaims: action.payload}
    default:
      return state;
  }
}

function mergeKeys(list1, list2) {
  return list1.map(function(l1Item){
    const list2Item = list2.find((l2Item) => (l2Item._id === l1Item._id));
    return Object.assign({}, l1Item, list2Item)
  })
}


function updateUserClaims(userClaims, products) {
      if (products.length === 0) {
        return {};
      }
      if (!window.web3  || !window.web3.currentProvider || !window.web3.currentProvider.selectedAddress) {
        return {};
      }
      const walletAddress = window.web3.currentProvider.selectedAddress;
      const userClaimsToMake = products.map(function(productItem){
        const claimsMadeForProduct = userClaims.filter(function(ucf){
          if ( ucf.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
          ucf.tokenAddress.toLowerCase() === productItem.tokenAddress.toLowerCase()) {
            return ucf;
          }
        });
        let totalTokensRedeemed = 0;
        const tokensRedeemed = productItem.logs ? productItem.logs.filter(function(log){
          if (log.from.toLowerCase() === walletAddress.toLowerCase()) {
            totalTokensRedeemed += Number(log.value)/Math.pow(10, 8);
            return log;
          }
        }) : [];
        const claimsLeftToBeMade = totalTokensRedeemed - Number(claimsMadeForProduct.length);
        return {'claimsMade': claimsMadeForProduct,
          'tokensRedeemed': tokensRedeemed,
          'tokenDetails': productItem,
          'totalRedeemed': totalTokensRedeemed,
          'claimsLeftToBeMade': claimsLeftToBeMade
        };
      });
      return userClaimsToMake;
}
