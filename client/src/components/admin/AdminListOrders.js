import React, {Component} from 'react';
import {Table, Row, Col, Dropdown, DropdownButton, Button} from 'react-bootstrap';
import {CSVLink} from 'react-csv';

export default class AdminListOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      filterStatus: 'all',
    }
  }
  componentDidMount() {
    this.props.fetchOrderList();
  }
  componentWillReceiveProps(nextProps) {
    const {orderFetchCommit} = nextProps;
    const {filterStatus} = this.state;
    if (nextProps.orders.length > 0 && this.props.orders.length === 0) {
      this.setOrderListByFilter(nextProps.orders,filterStatus)
    }
    if (nextProps.orders.length > 0 && orderFetchCommit !== this.props.orderFetchCommit) {
      this.setOrderListByFilter(nextProps.orders,filterStatus)
    }
  }
  
  setOrderListByFilter = (orderList, filterStatus) => {

    const newOrderList = orderList.map(function(item, idx){
      if (filterStatus === 'pending') {
        if (!item.status || item.status === filterStatus) {
          return item;
        } else {
          return null;
        }
      } else if (filterStatus === 'completed') {
        if (item.status && item.status.toLowerCase() === filterStatus) {
          return item;
        } else {
          return null;
        }
      } else {
        return item;
      }
    }).filter(Boolean);

    this.setState({'orderList': newOrderList});    
  }
  
  setFilterStatus = (value) => {
    const {orders} = this.props;
    this.setState({'filterStatus': value});
    this.setOrderListByFilter(orders, value);
  }
  
  markAllAsComplete = () => {
    const {orderList} = this.state;
    const status = 'completed';   
    this.props.setOrderListStatus(orderList, status);
  }
  
  markOrderAsComplete = (order) => {
    const status = 'completed';    
    this.props.setOrderListStatus([order], status);
  }
  
  markOrderAsPending = (order) => {
    const status = 'pending';
    this.props.setOrderListStatus([order], status);   
  }
    
  render() {
    const { orderList } = this.state;
    let tableBody = <tbody />;
    const self = this;
    if (orderList.length > 0) {
      tableBody = <tbody>{orderList.map(function(item, idx){
      let actionItem = '';
      if (item.status === 'pending') {
        actionItem = <Button onClick={()=>self.markOrderAsComplete(item)}className="pending-btn" >ORDER PENDING</Button>
      } else {
        actionItem = <Button onClick={()=>self.markOrderAsPending(item)} className="complete-btn" >ORDER COMPLETE</Button>
      }
        return (
        <tr key={`order-${item._id}-${idx}`}>
        <td>{item.productName}</td>
        <td>{item.shirtSize}</td>
        <td>
          <div>{item.fullName}</div>
          <div>{item.email}</div>
        </td>
        <td>{item.walletAddress ? `${item.walletAddress.substring(0, 5)}...${item.walletAddress.substring(item.walletAddress.length - 4, item.walletAddress.length )}` : ''}
        </td>
        <td>
          <div>{item.streetAddress}</div>
          <div>{item.city} {item.province}, {item.country}</div>
        </td>
        <td>
          {item.status}  
        </td>
        <td>
          {actionItem}
        </td>
        </tr>
        )
      })}</tbody>
    }
    const csvData = [[
      'transactionHash', 'fullName', 'email', 'shirtSize', 'streetAddress', 'city', 'zipCode', 'country', 'walletAddress',
      'productName', 'tokenSymbol', 'tokenAddress', 'dateRedeemed', 'status'
      ]];
    orderList.forEach(function(orderItem){
      csvData.push([
        orderItem.transactionHash, orderItem.fullName, orderItem.email, orderItem.shirtSize,
        orderItem.streetAddress, orderItem.city, orderItem.zipCode, orderItem.country, orderItem.walletAddress, orderItem.productName,
        orderItem.tokenSymbol, orderItem.tokenAddress, orderItem.dateRedeemed, orderItem.status
        ])
    });
    return (
      <div>
        <div className="product-info admin-product-info">
            <Row>
              <Col lg={4}>
                <div className="table-header">Orders</div>
              </Col>
              <Col lg={8}>
              <CSVLink data={csvData} className="action-link">Download CSV data</CSVLink>
              <Button className="admin-btn" onClick={this.markAllAsComplete}>Mark all as complete</Button>
              <DropdownButton id="dropdown-basic-button" title="Order Status" className="admin-btn status-filter-btn">
                <Dropdown.Item onClick={()=>this.setFilterStatus('pending')}>Pending</Dropdown.Item>
                <Dropdown.Item onClick={()=>this.setFilterStatus('completed')}>Completed</Dropdown.Item>
                <Dropdown.Item onClick={()=>this.setFilterStatus('all')}>All</Dropdown.Item>                
              </DropdownButton>
              </Col>
            </Row>
        </div> 
        <Table className="product-table">
          <thead>
            <tr>
              <th>
                Product Name
              </th>
              <th>
               Product Size
              </th>
              <th>
                Redeemer Details
              </th>
              <th>
                Redeemer wallet
              </th>
              <th>
                Address
              </th>
              <th>
                Status
              </th>
              <th>
                Action
              </th>
            </tr>
          </thead>
          {tableBody}
        </Table>
      </div>
      )
  }
}