import React, { Component } from 'react';
import {Container, Form, Button } from 'react-bootstrap';
import AdminTopNavbar from '../nav/AdminTopNavbar'
import './admin.scss';
import {
  Switch,
  Route,
} from "react-router-dom";
import axios from 'axios';
import AdminListProducts from './AdminListProducts';
import AdminAddProduct from './AdminAddProduct';
import AdminListOrders from './AdminListOrders';
import AdminEditProduct from './AdminEditProduct';
import AdminFulfill from './AdminFulfill';

const API_URL = process.env.REACT_APP_API_URL;

export default class AppAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      orders: [],
      orderFetchCommit: 0
    }
  }
  fetchOrderList = () => {
    const self = this;
    axios.get(`${API_URL}/orders`).then((response) => {
      self.setState({'orders': response.data.orders.sort(function(a, b){
        return  new Date(b.timeStamp) - new Date(a.timeStamp)
      }), orderFetchCommit: self.state.orderFetchCommit + 1});
    });
  }
  componentWillMount() {
    const self = this;
    const userToken = localStorage.getItem("auth_token");
    if (userToken) {
      axios.get('/authorize', {'headers': {'token': userToken}}).then(function(authResponse){
        console.log(authResponse);
      });
      axios.get(`${API_URL}/admin_products`).then((response) => {
        self.setState({'products': response.data.products});
      });
    }
  }

  fetchProductList = () => {
    const self = this;
    axios.get(`${API_URL}/admin_products`).then((response) => {
      self.setState({'products': response.data.products});
    });
  }

  submitLogin = (evt) => {
    evt.preventDefault();
    const {adminUsername, adminPassword} = this.state;
    const payload = {
      'username': adminUsername,
      'password': adminPassword
    }
    const self = this;
    const userToken = localStorage.getItem("auth_token");
    axios.post(`${API_URL}/login`, payload).then((response) => {
      this.setState({'authToken': response.data.token});
      localStorage.setItem('auth_token', response.data.token);
      axios.get(`${API_URL}/products`).then((response) => {
        self.setState({'products': response.data.products});
      });
    }).catch(function(err){
      this.setState({'error': 'Invalid username or password'});
    })
  }

  adminUsernameChanged = (evt) => {
    this.setState({'adminUsername': evt.target.value});
  }
  adminPasswordChanged = (evt) => {
    this.setState({'adminPassword': evt.target.value});
  }

  setOrderListStatus = (orderList, status) => {
    const self = this;
    if (!status) {
      status = 'completed';
    }
    const userToken = localStorage.getItem("auth_token");
    axios.post(`${API_URL}/set_status?status=${status}`, {'orderList': orderList},  {'headers': {'token': userToken}}).then(function(response){
      self.fetchOrderList();
    })
  }

  render() {
    const {products, orders, adminUsername, adminPassword, authToken, orderFetchCommit} = this.state;
    let userToken = '';
    if (localStorage.getItem("auth_token")) {
      userToken = localStorage.getItem("auth_token")
    } else if (authToken) {
      userToken = authToken;
    }

    let homePage = <span />;
    if  (!userToken) {
      homePage = (
        <div>
          <form onSubmit={this.submitLogin}>
            <Form.Control type="text" value={adminUsername} onChange={this.adminUsernameChanged} placeholder="Username"/>
            <Form.Control type="password" value={adminPassword} onChange={this.adminPasswordChanged} placeholder="Password"/>
            <Button type="submit">Submit</Button>
          </form>
        </div>
        )
    } else {
      homePage = <AdminListProducts products={products} fetchProductList={this.fetchProductList}/>
    }
    return (
      <div>
        <AdminTopNavbar connectToWallet={this.connectToWallet} />
        <Container fluid className="admin-app-container">
        <div >
        <Switch>
          <Route exact path="/admin">
            {homePage}
          </Route>
          <Route exact path="/admin/products">
            <AdminListProducts products={products} />
          </Route>
          <Route exact path="/admin/orders">
            <AdminListOrders orders={orders} fetchOrderList={this.fetchOrderList}
            setOrderListStatus={this.setOrderListStatus} orderFetchCommit={orderFetchCommit}/>
          </Route>
          <Route path="/admin/product/add">
            <AdminAddProduct fetchProductList={this.fetchProductList}/>
          </Route>
          <Route path="/admin/products/:id">
            <AdminEditProduct fetchProductList={this.fetchProductList}/>
          </Route>
          <Route path="/admin/fulfill/:id">
            <AdminFulfill />
          </Route>
        </Switch>
        </div>
        </Container>
      </div>
    )
  }
}
