import {connect} from 'react-redux';
import AppLanding from './AppLanding';
import {
  getProductList, getProductListSuccess, getProductListFailure,
  getMeta, getMetaSuccess, getMetaFailure,
  getPrices, getPricesSuccess, getPricesFailure,
  getPastEvents, getPastEventsSuccess, getPastEventsFailure,
  getUserWalletBalance, getUserWalletBalanceSuccess, getUserWalletBalanceFailure,
  getUserClaims, getUserClaimsSuccess, getUserClaimsFailure  
} from '../../actions/token';

import { submitProductClaim, submitProductClaimSuccess, 
  submitProductClaimFailure, getApproval, getApprovalFailure,
  getApprovalSuccess, buyToken, buyTokenSuccess, buyTokenFailure,
  setTransactionStatus, sellToken, sellTokenSuccess, sellTokenFailure,
} from '../../actions/transaction';

import {redeemToken, redeemTokenSuccess, redeemTokenFailure} from '../../actions/transaction';

const mapStateToProps = state => {
  return {
    token: state.token,
    transaction: state.transaction,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getProductList: () => {
      dispatch(getProductList()).then(function(response){
        dispatch(getProductListSuccess(response.payload.data));
      }).catch(function(err){
        getProductListFailure(err);
      })
    },
    getUserWalletBalance: (productList) => {
      dispatch(getUserWalletBalance(productList)).then(function(response){
        dispatch(getUserWalletBalanceSuccess(response.payload));
      }).catch(function(err){
        dispatch(getUserWalletBalanceFailure(err));
      })
    },
    submitProductClaim: (payload) => {
      dispatch(submitProductClaim(payload)).then(function(response){
        dispatch(submitProductClaimSuccess(response.payload.data));
      }).catch(function(err){
        dispatch(submitProductClaimFailure(err));
      })
    },
    getProductMeta: (products) => {
      dispatch(getMeta(products)).then(function(response){
        dispatch(getMetaSuccess(response.payload));
      }).catch(function(err){
        dispatch(getMetaFailure(err));
      })
    },
    
    fetchUserClaims: (walletAddress) => {
      dispatch(getUserClaims(walletAddress)).then(function(response){
        dispatch(getUserClaimsSuccess(response.payload.data));
      }).catch(function(err){
        dispatch(getUserClaimsFailure(err));
      })
    },
  
    getProductPrices: (products) => {
      dispatch(getPrices(products)).then(function(response){
        dispatch(getPricesSuccess(response.payload));
      }).catch(function(err){
        dispatch(getPricesFailure(err))
      })
    },
    
    getProductPastEvents: (products) => {
      dispatch(getPastEvents(products)).then(function(response){
        dispatch(getPastEventsSuccess(response.payload));
      }).catch(function(err){
        dispatch(getPastEventsFailure(err));
      })
    },
    redeemProductToken: (web3, product, amount) => {
      dispatch(setTransactionStatus("waitingConfirmation"));
      dispatch(redeemToken(web3, product, amount)).then(function(response){
        dispatch(redeemTokenSuccess(response.payload));
        dispatch(setTransactionStatus("successConfirmation"));
      }).catch(function(err){
        dispatch(setTransactionStatus("failedTransaction"));        
        dispatch(redeemTokenFailure(err));
      })
    },
    
    buyToken: (product, collateral, amount) => {
      dispatch(setTransactionStatus("pendingApproval"));
      dispatch(getApproval(collateral.address, amount)).then(function(approvalResponse){
        dispatch(setTransactionStatus("waitingConfirmation"));
        dispatch(buyToken(product, collateral, amount)).then(function(buyTokenResponse){
          dispatch(setTransactionStatus("successConfirmation"));
          dispatch(buyTokenSuccess(buyTokenResponse));
        }).catch(function(err){
          dispatch(setTransactionStatus("failedApproval"));
          dispatch(buyTokenFailure(err));
        })
      }).catch(function(err){
        dispatch(setTransactionStatus("failedTransaction"));
        dispatch(getApprovalFailure(err))
      })
    },
    
    sellToken: (product, collateral, amount) => {
      dispatch(setTransactionStatus("pendingApproval"));
      dispatch(getApproval(product.tokenAddress, amount)).then(function(approvalResponse){
        dispatch(setTransactionStatus("waitingConfirmation"));
        dispatch(sellToken(product, collateral, amount)).then(function(buyTokenResponse){
          dispatch(setTransactionStatus("successConfirmation"));
          dispatch(sellTokenSuccess(buyTokenResponse));
        }).catch(function(err){
          dispatch(setTransactionStatus("failedApproval"));
          dispatch(sellTokenFailure(err));
        })
      }).catch(function(err){
        dispatch(setTransactionStatus("failedTransaction"));
        dispatch(getApprovalFailure(err))
      })      
    },

  }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppLanding);
