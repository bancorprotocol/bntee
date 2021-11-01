import React, {Component} from 'react';
import {Form, Container, Button, Modal} from 'react-bootstrap';
import { isEmptyString, isNonEmptyString } from '../../utils/ObjectUtils';
import { countryTovalue } from './Country';
import Select from 'react-select';
const availableSizeOptions = ['XS', 'S', 'M' , 'L' ,'XL', '2XL' ,'3XL']

export default class ClaimProductDialog extends Component {
  constructor(props) {
    super(props);
    this.fullName = React.createRef();
    this.email = React.createRef();
    this.shirtSize = React.createRef();
    this.streetAddress = React.createRef();
    this.city = React.createRef();
    this.zipCode = React.createRef();
    this.province = React.createRef();
    this.country = React.createRef();
    this.state = {
      'selectedSizeOption': 'M',
      'error': ''
    }
  }

  componentWillReceiveProps(nextProps) {
    const {onHide, claimDialogVisible, redeemProduct} = nextProps;
    if (!this.props.claimDialogVisible && claimDialogVisible) {
      this.setState({
        'error': ''
      })
    }
  }

  submitClaimForm = (evt) => {
    evt.preventDefault();
    const {transaction: {from, transactionHash}, redeemProduct} = this.props;
    const {selectedSizeOption} = this.state;
    const selctedAddress = window.web3.currentProvider.selectedAddress;
    let country = '';
    if (this.country.current.state.value && this.country.current.state.value.value) {
      country = this.country.current.state.value.value;
    }
    const payload = {
      fullName: this.fullName.current.value,
      email: this.email.current.value,
      shirtSize: selectedSizeOption,
      streetAddress: this.streetAddress.current.value,
      city: this.city.current.value,
      zipCode: this.zipCode.current.value,
      country: country,
      state: this.province.current.value,
      walletAddress: selctedAddress.toLowerCase(),
      transactionHash: transactionHash,
      productName: redeemProduct.productName,
      tokenSymbol: redeemProduct.tokenSymbol,
      tokenAddress: redeemProduct.tokenAddress.toLowerCase()
    }
    this.setState({
      'error': ''
    })
    if (isEmptyString(payload.fullName)) {
      this.setState({'error': 'Name cannot be empty'});
    } else if (isEmptyString(payload.email)) {
      this.setState({'error': 'Email cannot be empty'});
    } else if (isEmptyString(payload.streetAddress)) {
      this.setState({'error': 'Street Address cannot be empty'});
    } else if (isEmptyString(payload.city)) {
      this.setState({'error': 'City cannot be empty'});
    } else if (isEmptyString(payload.country)) {
      this.setState({'error': 'Country cannot be empty'});
    } else {
      this.props.submitProductClaim(payload);
      this.props.onHide();
    }
  }

  selectedSizeOptionChanged = (evt) => {
    this.setState({'selectedSizeOption': evt.target.value})
  }

  render() {
    const {onHide, claimDialogVisible, redeemProduct} = this.props;
    const {selectedSizeOption, error} = this.state;
    let variantOptions = availableSizeOptions;
    if (redeemProduct && redeemProduct.variantToSizeMap && redeemProduct.variantToSizeMap.length > 0) {
      variantOptions = redeemProduct.variantToSizeMap.map(function(item){
        return item.variantType
      })
    }
    const sizeOptions =  variantOptions.map(function(item, idx){
      return <option value={item}>{item}</option>
    });
    let errorDisplay = <span />;
    if (isNonEmptyString(error)) {
      errorDisplay = <div className="error">{error}</div>
    }

    const countryOptions = countryTovalue();

    return (
        <Modal
          show={claimDialogVisible}
          onHide={onHide}
          backdrop="static"
          keyboard={false}
          className="token-dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title>
            <div className="claim-address-header">
              &#128085;&nbsp; Redeem your {redeemProduct.tokenSymbol} T-Shirt
              &#128085;&nbsp;
            </div></Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Container>
          <div className="claim-product-label">
            Please fill in the order details to receive your purchase.
          </div>
        <div className="claim-address-form">
        <Form onSubmit={this.submitClaimForm}>
        <Form.Group>
          <Form.Label>Full Name</Form.Label>
          <Form.Control type="text" placeHolder="Full Name" ref={this.fullName}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeHolder="Email address" ref={this.email}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>T-Shirt size</Form.Label>
            <Form.Control as="select" value={selectedSizeOption} onChange={this.selectedSizeOptionChanged}>
              {sizeOptions}
            </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>St. Address</Form.Label>
          <Form.Control type="text" placeHolder="Street Address" ref={this.streetAddress}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control type="text" placeHolder="City" ref={this.city}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Postal Code</Form.Label>
          <Form.Control type="text" placeHolder="Postal Code" ref={this.zipCode}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>
            <div>State/Province</div>
            <div>(If applicable)</div>
          </Form.Label>
          <Form.Control type="text" placeHolder="State/Province" ref={this.province}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Country</Form.Label>
          <Select options={countryOptions} className='country-select-container' ref={this.country}/>
        </Form.Group>
        <div>
          {errorDisplay}
        </div>
        <Button type="submit" className="claim-submit-btn">
          Submit
        </Button>
        </Form>
        </div>
        </Container>
      </Modal.Body>
      </Modal>

      )
  }
}
