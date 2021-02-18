import React, {Component} from 'react';
import { Modal, Button } from 'react-bootstrap';
import './dialogs.scss';
import NumericInput from 'react-numeric-input';
import { Row, Col } from 'react-bootstrap';


export default class PlaceOrderDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'amountReserve': 0,
      'errorMessage': '',
    };
  }
  componentWillReceiveProps(nextProps) {
    const {redeemDialogVisible} = nextProps;
    if (!redeemDialogVisible && this.props.redeemDialogVisible) {
      this.setState({'amountReserve': 0, errorMessage: ''});
    }
  }  
  amountReserveChanged = (value) => {
    const {redeemProduct} = this.props;
    this.setState({'errorMessage': ''});
    if (!isNaN(value)) {
      this.setState({'amountReserve': parseInt(value)});
    }
  }
  redeemProductToken = () => {
    const {amountReserve} = this.state;
    const {redeemProduct} = this.props;
    const redeemValue = Number(amountReserve);
    this.setState({'errorMessage': ''});
    if (redeemValue > 0 && redeemValue <= Number(redeemProduct.userBalance)) {
      this.props.redeemToken(redeemProduct, amountReserve);
      this.props.onHide();
    } else if (redeemValue === 0){
      this.setState({'errorMessage': 'Value to redeem must be greater than 0'});
    } else {
      this.setState({'errorMessage': 'Cannot redeem more tokens than available in your wallet'});
    }
  }
  render() {
    const { redeemDialogVisible, redeemProduct, onHide, returnPrice} = this.props;    
    const {errorMessage} = this.state;
    let errorMessageDisplay = <span/>;
    if (errorMessage && errorMessage.length > 0) {
      errorMessageDisplay = <div className="error">{errorMessage}</div>
    }
    let userBalance = 0;
    if (redeemProduct.userBalance) {
      userBalance = Math.floor(Number(redeemProduct.userBalance));
    }
    return (
      <div>
        <Modal
          show={redeemDialogVisible}
          onHide={onHide}
          keyboard={false}
          className="token-dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title className="h5">
              &#128293;
              Burn {redeemProduct.tokenSymbol} token to redeem T-shirt
              &#128293;
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={redeemProduct.productFrontImageSmall} className="buy-product-image"/>
            <div className="input-form-container">
              <Row>
              <Col lg={6} xs={12}>
                <NumericInput min={1} max={100}
                  step={1} precision={0} value={this.state.amountReserve}
                  className="input-token numeric-input-token" onChange={this.amountReserveChanged}/>
                <div className="form-label redeem-label">Amount of {redeemProduct.tokenSymbol} T-Shirts to Redeem</div>
                <div className="form-label redeem-label">Your {redeemProduct.tokenSymbol} balance = {userBalance}</div>  
                <div className="form-label">
                  <div className="redeem-label">Only whole tokens can be redeemed for a physical item. E.G. 1 BNTEE = 1 BNTEE T-Shirt.</div>
                  <div className="redeem-label">Remaining {redeemProduct.tokenSymbol} "dust" can be sold back to the protocol or HODLed.</div>
                </div>
              </Col>
              <Col lg={6} xs={12}>
                <div className="form-label text-sub">
                  <div className="redeem-message">
                  &#128293;&#128293;
                    Redeeming the physical {redeemProduct.tokenSymbol} Shirt burns the corresponding amount of {redeemProduct.tokenSymbol} tokens —
                    making them unrecoverable.
                    &#128293;&#128293;
                  </div>
                </div>
              </Col>
              </Row>
              <Row>
                <Col lg={7}>

                </Col>
                <Col lg={5}>
                  <div>{errorMessageDisplay}</div>                
                  <Button onClick={this.redeemProductToken} className="transaction-btn">Redeem</Button>
                </Col>
              </Row>
            </div>
          </Modal.Body>
        </Modal>        
      </div>
      )
  }
}