import React, {Component} from 'react';
import { Modal,} from 'react-bootstrap';
import {isEmptyObject} from '../../utils/ObjectUtils';

export default class BuyTokenSuccessDialog extends Component {
  render() {
    const {buyTokenTransaction, buyTokenSuccessDialogVisible, onHide, products} = this.props;
    if (isEmptyObject(buyTokenTransaction)) {
      return <span/>;
    }
    let amount  = '';
    let toTokenSymbol = '';
    if (buyTokenTransaction && buyTokenTransaction.events && buyTokenTransaction.events.Conversion
    && buyTokenTransaction.events.Conversion.returnValues) {
      if (buyTokenTransaction.events.Conversion.returnValues._toAmount) {
        const amountValue = buyTokenTransaction.events.Conversion.returnValues._toAmount;
        amount = Number(amountValue)/Math.pow(10, 8);
        amount = Math.floor(amount);
      }
      if (buyTokenTransaction.events.Conversion.returnValues._toToken) {
        const toTokenAddress = buyTokenTransaction.events.Conversion.returnValues._toToken;
        const toTokenObject = products.find((p) => (p.tokenAddress.toLowerCase() === toTokenAddress.toLowerCase()));
        if (toTokenObject) {
          toTokenSymbol = toTokenObject.tokenSymbol;
        }
      }
    }
    return (
        <Modal
          show={buyTokenSuccessDialogVisible}
          onHide={onHide}
          keyboard={false}
          className="token-dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="success-buy-text">
            	&#127881; Successfully purchased {amount} {toTokenSymbol} tokens.	&#127881;
            </div>
          </Modal.Body>
      </Modal>
    )
  }
}