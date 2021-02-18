import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './nav.scss';
import bancorLogo from '../../images/bntee_logo.png';
import { Link } from 'react-router-dom';

export default class AdminTopNavbar extends Component {
  render() {
    return (
      <Navbar expand="lg" className="nav-container">
        <Navbar.Brand>
          <Link to="/">
            <img src={bancorLogo} className="bancor-logo-img" alt="logo"/>
          </Link>
        </Navbar.Brand>
         <Nav className="mr-auto">
          <Link to={`/admin/products`}>Products</Link>
          <Link to={`/admin/orders`}>Orders</Link>
        </Nav>
      </Navbar>
      )
  }
}