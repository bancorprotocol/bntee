import React, { Component } from 'react';
import {Form, Button} from 'react-bootstrap';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import { getConverterForAnchor } from '../../utils/BancorTrader';

const API_SERVER = process.env.REACT_APP_API_URL;

class AdminAddProduct extends Component {
  constructor(props) {
    super(props);
    this.productName = React.createRef();
    this.tokenAddress = React.createRef();
    this.tokenSymbol = React.createRef();
    this.poolAddress = React.createRef();
    this.converterAddress = React.createRef();
    this.productFrontImageSmall = React.createRef();
    this.productFrontImageLarge = React.createRef();
    this.productBackImageSmall = React.createRef();
    this.productBackImageLarge = React.createRef();
    this.nftId = React.createRef();
    this.nftAddress = React.createRef();
  }
  submitForm = (evt) => {
    evt.preventDefault();
    const {history} = this.props;
    const self = this;
    let payload = {
      productName: this.productName.current.value,
      tokenAddress: this.tokenAddress.current.value,
      tokenSymbol: this.tokenSymbol.current.value,
      poolAddress: this.poolAddress.current.value,
      converterAddress: this.converterAddress.current.value,
      productFrontImageSmall: this.productFrontImageSmall.current.value,
      productFrontImageLarge: this.productFrontImageLarge.current.value,
      productBackImageSmall: this.productBackImageSmall.current.value,
      productBackImageLarge: this.productBackImageLarge.current.value,
      nftId: this.nftId.current.value,
      nftAddress: this.nftAddress.current.value,
    }
    const userToken = localStorage.getItem("auth_token");    
    axios.post(`${API_SERVER}/product`, payload, {'headers': {'token': userToken}}).then(function(dataResponse){
      self.props.fetchProductList();
      history.replace('/admin/products');
    });
  }
  render() {
    return (
      <div className="add-product-container">
        <form onSubmit={this.submitForm} className="app-form">
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control type="text" placeholder="Product Name" ref={this.productName} />
          </Form.Group>
          <Form.Group controlId="formProductTokenAddress">
            <Form.Label>Token Address</Form.Label>
            <Form.Control type="text" placeholder="Token Address" ref={this.tokenAddress} />
          </Form.Group>
          <Form.Group controlId="formProductTokenSymbol">
            <Form.Label>Token Symbol</Form.Label>
            <Form.Control type="text" placeholder="Token Symbol" ref={this.tokenSymbol} />
          </Form.Group>
          <Form.Group controlId="formProductPoolAddress">
            <Form.Label>Pool Address</Form.Label>
            <Form.Control type="text" placeholder="Pool Address" ref={this.poolAddress} />
          </Form.Group>
          <Form.Group controlId="formProductPoolAddress">
            <Form.Label>Converter Address</Form.Label>
            <Form.Control type="text" placeholder="Converter Address" ref={this.converterAddress} />
          </Form.Group>
          <Form.Group controlId="formProductFrontImage">
            <Form.Label>Product Front Image Small URL (500px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Front Image URL" ref={this.productFrontImageSmall} />
          </Form.Group>
          <Form.Group controlId="formProductFrontImage">
            <Form.Label>Product Front Image Large URL (1200px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Front Image URL" ref={this.productFrontImageLarge} />
          </Form.Group>
          <Form.Group controlId="formProductBackImage">
            <Form.Label>Product Back Image Small URL (500px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Back Image URL" ref={this.productBackImageSmall} />
          </Form.Group>
          <Form.Group controlId="formProductBackImage">
            <Form.Label>Product Back Image Large URL (1200px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Back Image URL" ref={this.productBackImageLarge} />
          </Form.Group>
          <Form.Group controlId="formProductBackImage">
            <Form.Label>NFT Id</Form.Label>
            <Form.Control type="text" placeholder="NFT Id"
            ref={this.nftId}/>
          </Form.Group>
          <Form.Group controlId="formProductBackImage">
            <Form.Label>NFT Address</Form.Label>
            <Form.Control type="text" placeholder="NFT Address"
            ref={this.nftAddress}/>
          </Form.Group>
          <Button type="submit">Add</Button>
        </form>
      </div>
      )
  }
}

export default withRouter(AdminAddProduct);
