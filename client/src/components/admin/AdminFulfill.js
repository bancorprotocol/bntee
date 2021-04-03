import React, {Component} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = process.env.REACT_APP_API_URL;

class AdminFulfill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderData: {},
    }
  }
  componentWillMount() {
    const {match: {params}} = this.props;
    const self = this;
    if (params && params.id) {
    const userToken = localStorage.getItem("auth_token");
    axios.get(`${API_URL}/fulfillment_order_details?orderId=${params.id}`, {'headers': {'token': userToken}})
      .then(function(response){
        self.setState({'orderData': response.data});
      })
    }
  }

  createOrder = () => {
    const self = this;
    const {orderData} = this.state;
    const product = orderData.product;
    const order = orderData.order;
    const fulfillment = orderData.fulfillment;
    const variant = orderData.variant;
    const orderId = order._id;
    const nameParts = order.fullName.split(' ');
    const fistName = nameParts[0];
    let lastName = '';
    if (nameParts.length > 1) {
      lastName = nameParts[1];
    }
    const payload = {
    "label": product.productName ? product.productName  : product.tokenSymbol,
    "line_items": [
      {
        "product_id": fulfillment.id,
        "variant_id": variant.id,
        "quantity": 1
      }
    ],
    "shipping_method": 1,
    "send_shipping_notification": false,
    "address_to": {
      "first_name": fistName,
      "last_name": lastName,
      "email": order.email,
      "phone": "202-555-0148",
      "country": order.country,
      "region": order.state ? order.state : '',
      "address1": order.streetAddress,
      "city": order.city,
      "zip": order.zipCode,
    }
  }
    const userToken = localStorage.getItem("auth_token");
    axios.post(`${API_URL}/fulfill_order?orderId=${orderId}`, {'payload': payload}, {'headers': {'token': userToken}}).then(function(fulfillmentResponse){
      toast.success("Successfully dispatched order", {
         position: toast.POSITION.TOP_CENTER
       });
    }).catch(function(err){
      toast.error("Could not dispatch order, please try manually !", {
        position: toast.POSITION.TOP_LEFT
      });
    });
  }
  render() {
    const {orderData} = this.state;
    if (!orderData || orderData === null || Object.keys(orderData).length === 0) {
      return <span />;
    }
    const product = orderData.product;
    const order = orderData.order;
    const fulfillment = orderData.fulfillment;
    const variant = orderData.variant;
    console.log(variant);
    return (
      <Container>
      <ToastContainer />
        <div>
        <div className="h4">Order details</div>
        <Row>
          <Col lg={4}>
          <div className="label">Customer</div>
          <div className="value">{order.fullName}</div>
          </Col>
          <Col lg={4}>
            <div className="label">Email</div>
            <div className="value">{order.email}</div>
          </Col>
          <Col lg={4}>
            <div className="label">Wallet</div>
            <div className="value">{order.walletAddress}</div>
          </Col>
        </Row>
        </div>
        <div>
        <div className="h4">
          Product details
        </div>
          <Row>
            <Col lg={4}>
              <div className="label">Token name</div>
              <div className="value">{product.productName}</div>
            </Col>
            <Col lg={4}>
            <div className="label">Product variant</div>
            <div className="value">{variant.title}</div>
            </Col>
            <Col lg={4}>
            <div className="label">Printify ID</div>
            <div className="value">{fulfillment.id}</div>
            </Col>
          </Row>
        </div>
        <div className="product-order-button-container">
        <Button onClick={this.createOrder}>
          Create order
        </Button>
        </div>
      </Container>
    )
  }
}

export default withRouter(AdminFulfill);
