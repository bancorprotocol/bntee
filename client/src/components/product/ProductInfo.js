import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import '../common/common.scss';

export default class ProductInfo extends Component {
  render() {
    const {currentProduct} = this.props;

    
    let redeemedProductValue = 0;
    if (currentProduct.logs) {
      currentProduct.logs.forEach(function(log){
        if (log.value){
          redeemedProductValue += parseInt(log.value) / Math.pow(10, 8)
        }
      })
    }
    let mainTokenHolding = 0;
    let reserveTokenHolding = 0;
    if (currentProduct.reserves && currentProduct.reserves.main) {
      mainTokenHolding = Math.round(currentProduct.reserves.main * 100) / 100
    }
    if (currentProduct.reserves && currentProduct.reserves.reserve) {
      reserveTokenHolding = Math.round(currentProduct.reserves.reserve * 100) / 100;
    }
    let initialProductValue = Number(currentProduct.totalSupply) + Number(redeemedProductValue);    
    return (
      <div className="product-info-container">
       <ListGroup>
        <ListGroupItem>&#128085;&nbsp; <span className="info-label">Initial {currentProduct.tokenSymbol}s</span> <span className="list-group-value">{initialProductValue}</span></ListGroupItem>
        <ListGroupItem>&#127946;&nbsp; <span className="info-label">BNTee pool value: </span> <span className="list-group-value">{mainTokenHolding} {currentProduct.tokenSymbol} {reserveTokenHolding} BNT</span></ListGroupItem>
       </ListGroup>
       <div className="price-info-label">
         The price of BNTee changes when the tokens are bought or sold.
       </div>
      </div>
      )
  }
}