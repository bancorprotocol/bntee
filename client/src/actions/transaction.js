import { redeemProductERC20Token } from '../utils/RedeemableToken';
import axios from 'axios';
import { getApprovalForBancorNetwork, buyProductERC20Token, sellProductERC20Token } from '../utils/BancorTrader';

export const REDEEM_TOKEN = 'REDEEM_TOKEN';
export const REDEEM_TOKEN_SUCCESS = 'REDEEM_TOKEN_SUCCESS';
export const REDEEM_TOKEN_FAILURE = 'REDEEM_TOKEN_FAILURE';

export const SUBMIT_PRODUCT_CLAIM = 'SUBMIT_PRODUCT_CLAIM';
export const SUBMIT_PRODUCT_CLAIM_SUCCESS = 'SUBMIT_PRODUCT_CLAIM_SUCCESS';
export const SUBMIT_PRODUCT_CLAIM_FAILURE = 'SUBMIT_PRODUCT_CLAIM_FAILURE';

export const BUY_TOKEN = 'BUY_TOKEN';
export const BUY_TOKEN_SUCCESS = 'BUY_TOKEN_SUCCESS';
export const BUY_TOKEN_FAILURE = 'BUY_TOKEN_FAILURE';

export const SELL_TOKEN = 'SELL_TOKEN';
export const SELL_TOKEN_SUCCESS = 'SELL_TOKEN_SUCCESS';
export const SELL_TOKEN_FAILURE = 'SELL_TOKEN_FAILURE';

export const GET_APPROVAL = 'GET_APPROVAL';
export const GET_APPROVAL_SUCCESS = 'GET_APPROVAL_SUCCESS';
export const GET_APPROVAL_FAILURE = 'GET_APPROVAL_FAILURE';

export const SET_TRANSACTION_STATUS = 'SET_TRANSACTION_STATUS';

export const RESET_WEB3 = 'RESET_WEB3';

export const GET_USER_CLAIMS = 'GET_USER_CLAIMS';
export const GET_USER_CLAIMS_SUCCESS = 'GET_USER_CLAIMS_SUCCESS';
export const GET_USER_CLAIMS_FAILURE = 'GET_USER_CLAIMS_FAILURE';

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

export function setTransactionStatus(status) {
  return {
    type: SET_TRANSACTION_STATUS,
    payload: status
  }
}

export function resetWeb3() {
  return {
    type: RESET_WEB3
  }
}

export function buyToken(product, collateral, amount) {
  const request = buyProductERC20Token(product, collateral, amount);
  return {
    type: BUY_TOKEN,
    payload: request
  }
}

export function buyTokenSuccess(response) {
  return {
    type: BUY_TOKEN_SUCCESS,
    payload: response
  }
}

export function buyTokenFailure(err) {
  return {
    type: BUY_TOKEN_FAILURE,
    payload: err
  }
}

export function sellToken(product, collateral, amount) {
  const request = sellProductERC20Token(product, collateral, amount);
  return {
    type: SELL_TOKEN,
    payload: request
  }
}

export function sellTokenSuccess(response) {
  return {
    type: SELL_TOKEN_SUCCESS,
    payload: response
  }
}

export function sellTokenFailure(err) {
  return {
    type: SELL_TOKEN_FAILURE,
    payload: err
  }
}

export function getApproval(collateralAddress, amount) {
  const request = getApprovalForBancorNetwork(collateralAddress, amount);
  return {
    type: GET_APPROVAL,
    payload: request,
  }
}

export function getApprovalSuccess(response) {
  return {
    type: GET_APPROVAL_SUCCESS,
    payload: response
  }
}

export function getApprovalFailure(err) {
  return {
    type: GET_APPROVAL_FAILURE,
    payload: err
  }  
}


export function submitProductClaim(payload) {
  const API_URL = process.env.REACT_APP_API_URL;
  const request = axios.post(`${API_URL}/submit_claim`, payload);
  return {
    type: SUBMIT_PRODUCT_CLAIM,
    payload: request
  }
}

export function submitProductClaimSuccess(response) {
  return {
    type: SUBMIT_PRODUCT_CLAIM_SUCCESS,
    payload: response
  }
}

export function submitProductClaimFailure(err) {
  return {
    type: SUBMIT_PRODUCT_CLAIM_FAILURE,
    payload: err
  }
}

export function redeemToken(web3, product, amount) {
  const request = redeemProductERC20Token(web3, product, amount);
  return {
    type: REDEEM_TOKEN,
    payload: request
  }
}

export function redeemTokenSuccess(response) {
  return {
    type: REDEEM_TOKEN_SUCCESS,
    payload: response
  }
}

export function redeemTokenFailure(err) {
  return {
    type: REDEEM_TOKEN_FAILURE,
    payload: err
  }
}