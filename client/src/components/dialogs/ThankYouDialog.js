import React, {Component} from 'react';
import {Modal} from 'react-bootstrap';

export default class ThankYouDialog extends Component {
  render() {
    const {thankYouDialogVisible, onHide, productClaim} = this.props;
    return (
      <Modal show={thankYouDialogVisible} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Your order is being queued.</Modal.Title>
        </Modal.Header>
        <div className="thankyou-header"> Thank you for placing your order.</div>
        <div className="thankyou-body">
          <div>You will receive an email shortly</div>
          <div>once your order has been shipped.</div>
          <div className="nft-claim-btn">
            <a href={`${productClaim.openseaLink}`} target="_blank">Click here to claim your NFTee</a>
          </div>
          <div className="thankyou-footer">
            <div>See the "redeemable items" tab to view remaining physical items</div>
            <div>that you are eligible to claim.</div>
          </div>
        </div>
      </Modal>
      )
  }
}
