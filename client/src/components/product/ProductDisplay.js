import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faEye } from '@fortawesome/free-regular-svg-icons';
import ProductImage from '../common/ProductImage'
import ProductInfo from './ProductInfo'
import { Row, Col, Button} from 'react-bootstrap';

export default class ProductDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'currentView': 'image',
    }
  }

  showInfoView = () => {
    this.setState({'currentView': 'info'})
  }

  showProductView = () => {
    this.setState({'currentView': 'image'})
  }

  render() {
    const { currentProduct } = this.props;
    const {currentView} = this.state;
    let appCurrentView = <span/>;
    let displayToggle = <span/>;
    if (currentView === 'image') {
      appCurrentView = 
      <div className="merch-image-display">
      <ProductImage currentProduct={currentProduct}/>
      </div>;
      displayToggle = (
        <div className="card-stats" onClick={this.showInfoView}>
          <div className="card-current-price">Price: <span>{currentProduct.priceUSD ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(currentProduct.priceUSD) : ''}</span></div>
          Pricing <FontAwesomeIcon icon={faQuestionCircle}/>
        </div>        
      )
    }
    if (currentView === 'info') {
      appCurrentView = <ProductInfo currentProduct={currentProduct} />;
      displayToggle = (
        <div className="card-stats" onClick={this.showProductView}>
          <div className="card-current-price">Price: <span>{currentProduct.priceUSD ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(currentProduct.priceUSD) : ''}</span></div>
          Product Display <FontAwesomeIcon icon={faEye}/>
        </div>        
      )      
    }
    const maximumTokens = currentProduct.totalSupply;
    
    let totalRedeemed = 0;
    let tokensInPool = '';
    if (currentProduct.reserves) {
      tokensInPool = Math.floor(currentProduct.reserves.main)
    }
    if (currentProduct.logs) {
      currentProduct.logs.forEach(function(log){
        if (log.value){
          totalRedeemed += parseInt(log.value) / Math.pow(10, 8)
        }
      })
    }
    


    return (
      <div>
        <div className="merch-img-container">
          {appCurrentView}
          <div className="app-info-container">
            <Row>
              <Col lg={6} xs={6} className="card-pricing-info">
                <div>
                  {totalRedeemed} Redeemed
                </div>
                <div className="card-available">
                  {tokensInPool} / {maximumTokens} available
                </div>
              </Col>
              <Col lg={6} xs={6} className="card-right-footer">
                {displayToggle}
              </Col>
            </Row>
          </div>
        </div>
        
        <div className="merch-btn-container">
        <Row>
          <Col lg={12} xs={12}>
           <Button className="buy-btn" onClick={()=>this.props.showBuyTokenDialog(currentProduct)}>Buy</Button>
          </Col>
        </Row>
        <Row className="sell-container">
          <Col lg={6}>
            <Button className="sell-btn" onClick={()=>this.props.sellToken(currentProduct)}>Sell</Button>
          </Col>
          <Col lg={6}>
            <Button className="sell-btn" onClick={()=>this.props.redeemToken(currentProduct)}>Redeem</Button>
          </Col>
        </Row>
        </div>
        </div>
      )
  }
}