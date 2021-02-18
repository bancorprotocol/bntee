import React, {Component} from 'react';

import {ListGroup, ListGroupItem, Modal} from 'react-bootstrap';

export default class PendingClaimDialog extends Component {
  render() {
    const {onHide, pendingClaimDialogVisible, userClaimsWithMeta} = this.props;
    let claimsAvailable = <span/>;
    const self = this;
    if (userClaimsWithMeta.length) {
      claimsAvailable = <ListGroup>{userClaimsWithMeta.map(function(ucm){
        if (ucm.claimsLeftToBeMade && ucm.claimsLeftToBeMade > 0) {
        return <ListGroupItem onClick={()=>self.props.makeClaimToProject(ucm.tokenDetails)} className="item-available-row">
          {ucm.claimsLeftToBeMade} {ucm.tokenDetails.tokenSymbol}  can be redeemed.
          </ListGroupItem>
        }
      })}</ListGroup>
    }
    return (
    <Modal
      show={pendingClaimDialogVisible}
      onHide={onHide}
      keyboard={false}
      className="token-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>
        <div className="claim-address-header">Choose an item to redeem</div></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="h3">Redeemable items</div>
        <div className="redeemable-subheader">You can only redeem one item at a time</div>
        <div className="claim-available-container">
        {claimsAvailable}
        </div>
      </Modal.Body>
    </Modal>  
    )
  }
}