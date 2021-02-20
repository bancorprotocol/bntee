import React, {Component} from 'react';

import { Modal, Button, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import './dialogs.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Row, Col } from 'react-bootstrap';
import { collateralRopsten, collateralMainnet } from '../../utils/constants.js';
import { debounce, throttle } from 'lodash';

const CURRENT_NETWORK = Number(process.env.REACT_APP_NETWORK_ID);

let marketCollateralList = collateralMainnet;
if (CURRENT_NETWORK === 3) {
  marketCollateralList = collateralRopsten;
}

export default class PlaceOrderDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {'amountReserve': 0, selectedCollateralToken: {},
      errorMessage: ''
    };
    this.throttleHandleChange = debounce(this.throttleHandleChange.bind(this), 500);    
  }
  componentDidMount() {
    this.setState({selectedCollateralToken: marketCollateralList[0]})
  }

 throttleHandleChange(value) {
   const self = this;
    const {sellProduct} = this.props;
    const {selectedCollateralToken} = this.state;
   self.props.getUpdatedSellPrice(sellProduct, selectedCollateralToken, value)
}

  amountReserveChanged = (evt) => {
    const value = evt.target.value;
    const {sellProduct} = this.props;
    if (Number(value) > Number(sellProduct.userBalance)) {
      this.setState({'errorMessage': 'Cannot sell more than user balance'});
    } else {
      this.setState({'errorMessage': ''})
    if (!isNaN(value)) {
      this.setState({'amountReserve': value});
      this.throttleHandleChange(value);
    }
    }
  }
  sellProductToken = () => {
    const {sellProduct} = this.props;
    const { amountReserve, selectedCollateralToken } = this.state;
    if (Number(amountReserve) > Number(sellProduct.userBalance)) {
      this.setState({'errorMessage': 'Cannot sell more than available balance'});
    } else if (Number(amountReserve) > 0) {
      this.props.sellToken(sellProduct, selectedCollateralToken, amountReserve);
      this.props.onHide();
    }
  }  
  changeCollateral = (newCollateral) => {
    const {sellProduct} = this.props;
    this.setState({'selectedCollateralToken': newCollateral})
    const amountReserve = this.state.amountReserve;
    this.props.getUpdatedSellPrice(sellProduct, newCollateral, amountReserve);
  }
  
  componentWillReceiveProps(nextProps) {
    const {sellDialogVisible} = nextProps;
    if (!sellDialogVisible && this.props.sellDialogVisible) {
      this.setState({'amountReserve': 0, errorMessage: ''});
      this.props.resetReturnPrice();
    }
  }  

  setMaxAmount = () => {
    const {sellProduct} = this.props;
    const {selectedCollateralToken} = this.state;
    const value = sellProduct.userBalance;
    this.setState({'errorMessage': ''})
    this.setState({amountReserve: value});
    this.props.getUpdatedSellPrice(sellProduct, selectedCollateralToken, value)    
  }
  render() {
    const { sellDialogVisible, sellProduct, onHide, returnPrice, returnPriceFetching} = this.props;
    const { selectedCollateralToken, errorMessage } = this.state;
    const self = this;
    const collateralOptions = marketCollateralList.map(function(item, idx){
      return <Dropdown.Item onClick={self.changeCollateral.bind(self, item)}>{item.symbol}</Dropdown.Item>
    });
    let errorMessageDisplay = <span/>;
    if (errorMessage && errorMessage.length > 0) {
     errorMessageDisplay = <div className="error">{errorMessage}</div> 
    }
    let isSellButtonDisabled = false;
    let buttonSpinner = <span />;
    if (returnPriceFetching) {
      isSellButtonDisabled = true;
      buttonSpinner = <FontAwesomeIcon icon={faSpinner} spin className="btn-spinner"/>
    }
    let userBalance = 0;
    if (sellProduct.userBalance && sellProduct.userBalance > 0) {
      userBalance = Math.floor(sellProduct.userBalance * 100) / 100;
    }
    
    return (
      <div>
        <Modal
          show={sellDialogVisible}
          onHide={onHide}
          keyboard={false}
          className="token-dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title>Sell {sellProduct.productName} Token</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={sellProduct.productFrontImageSmall} className="buy-product-image"/>
            <div className="input-form-container">
              <Row>
              <Col lg={5} xs={5}>
              <Form.Control
                type="text"
                className="input-token"
                value={this.state.amountReserve}
                onChange={this.amountReserveChanged}
                placeHolder={`Enter amount of ${sellProduct.productName}`}
              />
              <div className="form-label">Your {sellProduct.tokenSymbol} balance {userBalance}</div>
              <div className="max-amount-container" onClick={this.setMaxAmount}>Sell Max</div>
              <div>
              <div className="form-label text-sub">
                The amount of tokens displayed here refelects your true balance of {sellProduct.tokenSymbol}
              </div>
              </div>
              </Col>
              <Col lg={2} xs={1} className="exchange-icon-container">
                <FontAwesomeIcon icon={faExchangeAlt} size = '2x' className="exchange-icon"/>
              </Col>
              <Col lg={5} xs={5}>
                <div className="sell-form-value">
                <div className="sell-token-price">
                  {returnPrice.priceToken ? new Intl.NumberFormat().format(returnPrice.priceToken)  : '0.00'}
                </div>
                <DropdownButton id="buy-token-dropdown" title={selectedCollateralToken.symbol} className="input-token-select">
                  {collateralOptions}
                </DropdownButton>                 
                </div>
                <div className="form-label text-sub">
                  Amount {selectedCollateralToken.symbol}
                </div>
              </Col>
              </Row>
              <Row>
                <Col lg={7}>
                  <div className="total-container">
                    Total ${returnPrice.priceUSD ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(returnPrice.priceUSD) : ''}
                  </div>
                </Col>
                <Col lg={5}>
                  <div>{errorMessageDisplay}</div>
                  <Button onClick={this.sellProductToken}
                   disabled={isSellButtonDisabled} className="transaction-btn">{buttonSpinner} Sell</Button>
                </Col>
              </Row>
            </div>
          </Modal.Body>
        </Modal>        
      </div>
      )
  }
}