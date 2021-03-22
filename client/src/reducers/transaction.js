import { REDEEM_TOKEN, REDEEM_TOKEN_SUCCESS, REDEEM_TOKEN_FAILURE,
  SUBMIT_PRODUCT_CLAIM, SUBMIT_PRODUCT_CLAIM_SUCCESS, SUBMIT_PRODUCT_CLAIM_FAILURE,
  SET_TRANSACTION_STATUS, BUY_TOKEN, BUY_TOKEN_SUCCESS, BUY_TOKEN_FAILURE,
  SELL_TOKEN, SELL_TOKEN_SUCCESS, SELL_TOKEN_FAILURE
} from '../actions/transaction';

const initialState = {
  transactionState: {},
  redeemTokenTransaction: {},
  claimSubmitted: false,
  transactionStatus: '',
  redeemingToken: false,
  buyingToken: false,
  sellingToken: false,
  buyTokenTransaction: {},
  productClaim: {},
}

export default function transactionReducer (state = initialState, action) {
  switch (action.type) {
    case REDEEM_TOKEN:
      return {...state, redeemTokenTransaction: {}, redeemingToken: true}
    case REDEEM_TOKEN_SUCCESS:
      return {...state, redeemTokenTransaction: action.payload, redeemingToken: false}
    case REDEEM_TOKEN_FAILURE:
      return {...state, redeemTokenTransaction: {}, redeemingToken: false}
    case SUBMIT_PRODUCT_CLAIM:
      return {...state, claimSubmitted: false,   productClaim: {}}
    case SUBMIT_PRODUCT_CLAIM_SUCCESS:
      console.log(action.payload);
      return {...state, claimSubmitted: true, productClaim: action.payload}
    case SUBMIT_PRODUCT_CLAIM_FAILURE:
      return {...state, claimSubmitted: false, productClaim: {}}
    case BUY_TOKEN:
      return {...state, buyingToken: true, buyTokenTransaction: {}}
    case BUY_TOKEN_SUCCESS:
      return {...state, buyingToken: false, buyTokenTransaction: action.payload.payload}
    case BUY_TOKEN_FAILURE:
      return {...state, buyingToken: false}
    case SELL_TOKEN:
      return {...state, sellingToken: true}
    case SELL_TOKEN_SUCCESS:
      return {...state, sellingToken: false}
    case SELL_TOKEN_FAILURE:
      return {...state, sellingToken: false}
    case SET_TRANSACTION_STATUS:
      return {...state, transactionStatus: action.payload}
    default:
      return state;
  }
}