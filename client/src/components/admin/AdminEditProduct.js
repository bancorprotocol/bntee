import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import {isEmptyObject} from '../../utils/ObjectUtils';
import {Form, Button} from 'react-bootstrap';
const API_URL = process.env.REACT_APP_API_URL;


class AdminEditProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'product': {}
    }
  }
  componentWillMount() {
    const {match: {params}} = this.props;
    const self = this;
    axios.get(`${API_URL}/product?id=${params.id}`).then(function(response){
      self.setState({'product': response.data.product});
    })
  }
  updateProductState = (key, evt) => {
    const val = evt.target.value;
    console.log(val);
    let currentProductState = Object.assign({}, this.state.product);
    currentProductState[key] = val;
    this.setState({'product': currentProductState});
  }
  
  toggleDisabledCheck = (evt) => {
    let currentProductState = Object.assign({}, this.state.product);
    currentProductState['isDisabled'] = evt.target.checked;    
    this.setState({'product': currentProductState});    
  }
  submitForm = (evt) => {
    evt.preventDefault();
    const self = this;
    const {history} = this.props;
    const {product} = this.state;
    const userToken = localStorage.getItem("auth_token");     
    axios.put(`${API_URL}/product`, {'product': product}, {'headers': {'token': userToken}}).then(function(response){
      self.props.fetchProductList();
      history.replace(`/admin`);
    })
  }
  render() {
    const {product} = this.state;
    if (isEmptyObject(product)) {
      return <span />
    }
    return (
      <div className="add-product-container">
        <form onSubmit={this.submitForm} className="app-form">
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control type="text" placeholder="Product Name"  value={product.productName}
            onChange={(evt)=>this.updateProductState('productName', evt)}/>
          </Form.Group>        
          <Form.Group controlId="formProductTokenAddress">
            <Form.Label>Token Address</Form.Label>
            <Form.Control type="text" placeholder="Token Address" value={product.tokenAddress}
            onChange={(evt)=>this.updateProductState('tokenAddress', evt)}/>
          </Form.Group>
          <Form.Group controlId="formProductTokenSymbol">
            <Form.Label>Token Symbol</Form.Label>
            <Form.Control type="text" placeholder="Token Symbol" value={product.tokenSymbol}
            onChange={(evt)=>this.updateProductState('tokenSymbol', evt)}/>
          </Form.Group>  
          <Form.Group controlId="formProductPoolAddress">
            <Form.Label>Pool Address</Form.Label>
            <Form.Control type="text" placeholder="Pool Address" value={product.poolAddress} 
            onChange={(evt)=>this.updateProductState('poolAddress', evt)}/>
          </Form.Group>  
          <Form.Group controlId="formProductPoolAddress">
            <Form.Label>Converter Address</Form.Label>
            <Form.Control type="text" placeholder="Converter Address" value={product.converterAddress} 
            onChange={(evt)=>this.updateProductState('converterAddress', evt)}/>
          </Form.Group>           
          <Form.Group controlId="formProductFrontImage">
            <Form.Label>Product Front Image Small URL (500px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Front Image URL"
            value={product.productFrontImageSmall} 
            onChange={(evt)=>this.updateProductState('productFrontImageSmall', evt)}/>
          </Form.Group>
          <Form.Group controlId="formProductFrontImage">
            <Form.Label>Product Front Image Large URL (1200px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Front Image URL"
            value={product.productFrontImageLarge} 
            onChange={(evt)=>this.updateProductState('productFrontImageLarge', evt)}/>
          </Form.Group>          
          <Form.Group controlId="formProductBackImage">
            <Form.Label>Product Back Image Small URL (500px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Back Image URL"
            value={product.productBackImageSmall} 
            onChange={(evt)=>this.updateProductState('productBackImageSmall', evt)}/>
          </Form.Group>            
          <Form.Group controlId="formProductBackImage">
            <Form.Label>Product Back Image Large URL (1200px width)</Form.Label>
            <Form.Control type="text" placeholder="Product Back Image URL"
            value={product.productBackImageLarge} 
            onChange={(evt)=>this.updateProductState('productBackImageLarge', evt)}/>
          </Form.Group>  
          <Form.Group controlId="formDisabledCheck">
            <Form.Check 
            type={'checkbox'}
            label={`Disable product from store`}
            checked={product.isDisabled}
            onChange={this.toggleDisabledCheck}
            />
      </Form.Group>
          <Button type="submit">Update</Button>
        </form>
        </div>
      )
  }
}

export default withRouter(AdminEditProduct);