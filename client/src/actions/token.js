import { getTokenListMeta } from '../utils/PoolConverter';
import { getTokenListPrices } from '../utils/BancorTrader';
import { getPastEventsFromWallet, getWalletBalance } from '../utils/RedeemableToken';

import axios from 'axios';

export const GET_PRODUCT_LIST = 'GET_PRODUCT_LIST';
export const GET_PRODUCT_LIST_SUCCESS = 'GET_PRODUCT_LIST_SUCCESS';
export const GET_PRODUCT_LIST_FAILURE = 'GET_PRODUCT_LIST_FAILURE'

export const GET_META =  'GET_META';
export const GET_META_SUCCESS = 'GET_META_SUCCESS';
export const GET_META_FAILURE = 'GET_META_FAILURE';

export const GET_PRICES = 'GET_PRICES';
export const GET_PRICES_SUCCESS = 'GET_PRICES_SUCCESS';
export const GET_PRICES_FAILURE = 'GET_PRICES_FAILURE';

export const GET_PAST_EVENTS = 'GET_PAST_EVENTS';
export const GET_PAST_EVENTS_SUCCESS = 'GET_PAST_EVENTS_SUCCESS';
export const GET_PAST_EVENTS_FAILURE = 'GET_PAST_EVENTS_FAILURE';

export const GET_USER_WALLET_BALANCE = 'GET_USER_WALLET_BALANCE';
export const GET_USER_WALLET_BALANCE_SUCCESS = 'GET_USER_WALLET_BALANCE_SUCCESS';
export const GET_USER_WALLET_BALANCE_FAILURE = 'GET_USER_WALLET_BALANCE_FAILURE';

export const GET_USER_CLAIMABLE_TOKENS = 'GET_USER_CLAIMABLE_TOKENS';
export const GET_USER_CLAIMABLE_TOKENS_SUCCESS = 'GET_USER_CLAIMABLE_TOKENS_SUCCESS';
export const GET_USER_CLAIMABLE_TOKENS_FAILURE = 'GET_USER_CLAIMABLE_TOKENS_FAILURE';

export const GET_USER_CLAIMS = 'GET_USER_CLAIMS';
export const GET_USER_CLAIMS_SUCCESS = 'GET_USER_CLAIMS_SUCCESS';
export const GET_USER_CLAIMS_FAILURE = 'GET_USER_CLAIMS_FAILURE';

export const GET_USER_NFT_CLAIMS = 'GET_USER_NFT_CLAIMS';
export const GET_USER_NFT_CLAIMS_SUCCESS = 'GET_USER_NFT_CLAIMS_SUCCESS';
export const GET_USER_NFT_CLAIMS_FAILURE = 'GET_USER_NFT_CLAIMS_FAILURE';

export function getUserNFTClaims(userWallet) {
  console.log('HERE');
  console.log(userWallet);
  const API_URL = process.env.REACT_APP_API_URL;
  const request = axios.get(`${API_URL}/user_nft_claims?address=${userWallet}`)
  return {
    type: GET_USER_NFT_CLAIMS,
    payload: request,
  }
}

export function getUserNFTClaimsSuccess(response) {
  return {
    type: GET_USER_NFT_CLAIMS_SUCCESS,
    payload: response
  }
}

export function getUserNFTClaimsFailure(err) {
  return {
    type: GET_USER_NFT_CLAIMS_FAILURE,
    payload: err
  }
}

export function getUserClaims(walletAddress) {
  const API_URL = process.env.REACT_APP_API_URL;
  const request = axios.get(`${API_URL}/claims?address=${walletAddress}`)
  return {
    type: GET_USER_CLAIMS,
    payload: request
  }
}

export function getUserClaimsSuccess(response) {
  return {
    type: GET_USER_CLAIMS_SUCCESS,
    payload: response
  }
}

export function getUserClaimsFailure(err) {
  return {
    type: GET_USER_CLAIMS_FAILURE,
    payload: err
  }
}

export function getUserWalletBalance(productList) {
  const request = getWalletBalance(productList);
  return {
    type: GET_USER_WALLET_BALANCE,
    payload: request
  }
}

export function getUserWalletBalanceSuccess(response) {
  return {
    type: GET_USER_WALLET_BALANCE_SUCCESS,
    payload: response
  }
}

export function getUserWalletBalanceFailure(err) {
  return {
    type: GET_USER_WALLET_BALANCE_FAILURE,
    payload: err
  }
}

export function getPrices(productList) {
  const request = getTokenListPrices(productList);
  return {
    type: GET_PRICES,
    payload: request
  }
}

export function getPricesSuccess(response) {
  return {
    type: GET_PRICES_SUCCESS,
    payload: response,
  }
}

export function getPricesFailure(err) {
  return {
    type: GET_PRICES_FAILURE,
    payload: err
  }
}


export function getMeta(productList) {
  const request = getTokenListMeta(productList);
  return {
    type: GET_META,
    payload: request
  }
}

export function getMetaSuccess(response) {
  return {
    type: GET_META_SUCCESS,
    payload: response
  }
}

export function getMetaFailure(err) {
  return {
    type: GET_META_FAILURE,
    payload: err
  }
}

export function getPastEvents(productList) {
  const request = getPastEventsFromWallet(productList);
  return {
    type: GET_PAST_EVENTS,
    payload: request
  }
}

export function getPastEventsSuccess(response) {
  return {
    type: GET_PAST_EVENTS_SUCCESS,
    payload: response
  }
}

export function getPastEventsFailure(err) {
  return {
    type: GET_PAST_EVENTS_FAILURE,
    payload: err
  }
}

export function getProductList() {
  const API_URL = process.env.REACT_APP_API_URL;
  const request = axios.get(`${API_URL}/products`);
  return {
    type: GET_PRODUCT_LIST,
    payload: request
  }
}

export function getProductListSuccess(response) {
  return {
    type: GET_PRODUCT_LIST_SUCCESS,
    payload: response,
  }
}

export function getProductListFailure(err) {
  return {
    type: GET_PRODUCT_LIST_FAILURE,
    payload: err
  }
}
