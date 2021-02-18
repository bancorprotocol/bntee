import { combineReducers } from 'redux';
import tokenReducer from './token';
import transactionReducer from './transaction';


const rootReducer = combineReducers({
  token: tokenReducer,
  transaction: transactionReducer,
})

export default rootReducer