import React, {Component} from 'react';
import {Container, Row, Col, Table} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {withRouter} from 'react-router-dom';

class AdminListProducts extends Component {
  editProduct = (productItem) => {
    const {history} = this.props;
    history.replace(`/admin/products/${productItem._id}`)
  }
  render() {
  const {products} = this.props;
  let productList = <span />;
  if (products.length > 0) {
    const self = this;
    productList = <tbody>{products.map(function(pItem, pIdx){
      return (
        <tr onClick={()=>self.editProduct(pItem)}>
        <td>
          {pIdx + 1}
        </td>
         <td>
           {pItem.productName}
         </td>
         <td>
           {pItem.tokenAddress}
         </td>
         <td>
           {pItem.tokenSymbol}
         </td>
         <td>
           {pItem.poolAddress}
         </td>
        </tr>
        )
    })}</tbody>
  }
  return (
    <div>
      <div className="product-info">
          <Row>
            <Col lg={8}>
              <div className="table-header">
              Products
              </div>
            </Col>
            <Col lg={4}>
              <Link to="/admin/product/add" className="action-link">Add new product</Link>
            </Col>
          </Row>
      </div>    
      <Table className="product-table">
        <thead>
          <tr>
            <th>
            </th>
            <th>
              Name
            </th>
            <th>
              Token Address
            </th>
            <th>
              Token Symbol
            </th>
            <th>
              Pool Address
            </th>
            <th>
              Circulating supply
            </th>
            <th>
              Current price
            </th>
          </tr>
        </thead>
          {productList}
      </Table>
    </div>  
    )
  }
}

export default withRouter(AdminListProducts);