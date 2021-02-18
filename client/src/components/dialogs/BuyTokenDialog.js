import React, { Component } from 'react';
import { Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import './dialogs.scss';
import NumericInput from 'react-numeric-input';
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

export default class BuyTokenDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {'amountReserve': 0, selectedCollateralToken: {}, errorMessage: ''};
    this.throttleHandleChange = debounce(this.throttleHandleChange.bind(this), 500);
  }
  componentDidMount() {
    this.fetchInitialCollateralBalance();
  }
  
  fetchInitialCollateralBalance = () => {
    const initialSelectedCollateral = marketCollateralList[0];
    this.setState({selectedCollateralToken: initialSelectedCollateral});
    this.props.fetchUserBalance(initialSelectedCollateral);    
  }
  componentWillReceiveProps(nextProps) {
    const {buyProduct, buyDialogVisible, accountToggle} = nextProps;
    const {selectedCollateralToken} = this.state;
    if (!buyDialogVisible && this.props.buyDialogVisible) {
      this.setState({'amountReserve': 0, errorMessage: '', selectedCollateralToken: marketCollateralList[0]});
      this.props.resetReturnPrice();
    }
    if (buyDialogVisible && !this.props.buyDialogVisible) {
      if (selectedCollateralToken) {
        this.props.fetchUserBalance(selectedCollateralToken);
      } else {
        this.fetchInitialCollateralBalance();
      }      
    }
    if (!accountToggle && this.props.accountToggle && selectedCollateralToken) {
      this.props.fetchUserBalance(selectedCollateralToken);
    }
    
  }
  buyProductToken = () => {
    const {buyProduct, userCollateralBalance, returnPrice} = this.props;
    const { selectedCollateralToken, amountReserve} = this.state;
    const collateralAmountNeeded = returnPrice.priceToken;
    this.setState({'errorMessage': ''});    
    if (collateralAmountNeeded > 0) {
      if (Number(collateralAmountNeeded) > Number(userCollateralBalance)) {
        this.setState({'errorMessage': `You do not have enough ${selectedCollateralToken.symbol} to make this purchase.`});
      } else if (Number(amountReserve) > Number(buyProduct.reserves.main)) {
        this.setState({'errorMessage': 'Cannot buy more than available in the pool'});      
      } else if (Number(amountReserve) > 0) {
        this.props.buyToken(buyProduct, selectedCollateralToken, collateralAmountNeeded, amountReserve);
        this.props.onHide();
      }
    }
  }

 throttleHandleChange(value) {
    const self = this;
    const {buyProduct} = this.props;
    const {selectedCollateralToken} = this.state;
    self.props.getUpdatedPurchasePrice(buyProduct, selectedCollateralToken, value);
  }
  amountReserveChanged = (value) => {
    const {buyProduct} = this.props;
    this.setState({'errorMessage': ''});
    if (!isNaN(value)) {
      if (value > buyProduct.reserves.main) {
        this.setState({'errorMessage': 'Cannot buy more than available in pool'});      
      } else {
        this.setState({'amountReserve': value});
        this.throttleHandleChange(value);
      }
    }
  }
  
  changeCollateral = (newCollateral) => {
    const {buyProduct} = this.props;
    this.setState({'selectedCollateralToken': newCollateral})
    this.setState({'errorMessage': ''});
    const amountReserve = this.state.amountReserve;
    this.props.getUpdatedPurchasePrice(buyProduct, newCollateral, amountReserve);
    this.props.fetchUserBalance(newCollateral);
  }
  
  openConnectWallet = () => {
    this.props.onHide();
    this.props.connectToWallet();
  }

  render() {
  const {onHide, buyProduct, buyDialogVisible, returnPrice, userCollateralBalance, returnPriceFetching} = this.props;
  const {selectedCollateralToken, errorMessage} = this.state;
  const self = this;
  const collateralOptions = marketCollateralList.map(function(item, idx){
    return <Dropdown.Item onClick={self.changeCollateral.bind(self, item)}>{item.symbol}</Dropdown.Item>
  })
  let buyButton = <span />;
  
 
  const web3 = window.web3;
  let balanceLabel = <span/>;
  let isBuyButtonDisabled = false;
  let buttonSpinner = <span />;
  if (returnPriceFetching) {
    isBuyButtonDisabled = true;
    buttonSpinner = <FontAwesomeIcon icon={faSpinner} spin className="btn-spinner"/>
  }
  if (web3 && web3.currentProvider && web3.currentProvider.selectedAddress) {
     buyButton = 
     <Button
       onClick={this.buyProductToken}
       className="transaction-btn"
       disabled={isBuyButtonDisabled}
       >
       {buttonSpinner}
      Buy
    </Button>
     balanceLabel = <div>Your {selectedCollateralToken.symbol} balance {userCollateralBalance}</div>
  } else {
    buyButton = <Button onClick={this.openConnectWallet} className="transaction-btn">Connect</Button>
  }
  let errorMessageDisplay = <span />;
  if (errorMessage && errorMessage.length > 0) {
    errorMessageDisplay = <div className="error">{errorMessage}</div>
  }
  return (
      <div>
        <Modal
          show={buyDialogVisible}
          onHide={onHide}
          keyboard={false}
          className="token-dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title>Buy {buyProduct.tokenSymbol} token</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={buyProduct.productFrontImageSmall} className="buy-product-image"/>
            <div className="input-form-container">
              <Row>
              <Col lg={5} xs={5}>
                <NumericInput min={1} max={100}
                  step={1} precision={0} value={this.state.amountReserve}
                  className="input-token numeric-input-token buy-token-input"
                  onChange={this.amountReserveChanged}/>
                <div className="form-label">How many {buyProduct.tokenSymbol} do you want to buy?</div>  
              </Col>
              <Col lg={2} xs={1} className="exchange-icon-container">
                <FontAwesomeIcon icon={faExchangeAlt} size = '2x' className="exchange-icon"/>
              </Col>
              <Col lg={5} xs={5}>
                <div>
                  <div className="buy-amount-value">
                    {returnPrice.priceToken ? returnPrice.priceToken.toFixed(4) : '0.00'}
                  </div>
                  <div className="buy-token-selector">
                    <DropdownButton id="buy-token-dropdown" title={selectedCollateralToken.symbol} className="input-token-select">
                      {collateralOptions}
                    </DropdownButton>                  
                  </div>
                </div>
                <div className="form-label text-sub">
                  How do you want to pay?
                </div>
              <div className="form-label">{balanceLabel}</div>                
              </Col>
              </Row>
              <Row>
                <Col lg={7}>
                  <div className="total-container">
                    Total ${returnPrice.priceUSD ? returnPrice.priceUSD.toFixed(2) : ''}
                  </div>
                  <div className="total-sub">
                    Each token is redeemable for 1 {buyProduct.productName} shirt.
                  </div>
                </Col>
                <Col lg={5}>
                  {errorMessageDisplay}
                  {buyButton}
                </Col>
              </Row>
            </div>
          </Modal.Body>
        </Modal>        
      </div>
      )
  }
}