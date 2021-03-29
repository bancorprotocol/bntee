import React, { Component } from 'react';
import { Navbar, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './nav.scss';
import {isNonEmptyString} from '../../utils/ObjectUtils';
import bancorLogo from '../../images/bntee_logo.png'
import AddressButton from '../common/AddressButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faSpinner, faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const renderBalanceHelpTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    <div>Balance represents the number of WHOLE tokens you have purchased, but have not yet sold or claimed.
    You may still have decimal amounts of tokens in your wallet, that can be sold, but not used to claim physical items.</div>
  </Tooltip>
);

const renderClaimHelpTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    <div>"Redeemable Items" represent tokens you have redeemed (burned)
    but have not yet claimed the physical item for.</div>
  </Tooltip>
);

export default class TopNavbar extends Component {

  gotoClaimsPage = (token) => {
    window.open(token.nftLink);
  }
  render() {
    const {selectedAddress, transactionStatus, userClaimsWithMeta, products, userNftClaims} = this.props;
    let connectButton = <span/>;
    let transactionStatusButton = <span/>;
    let claimButton = <span />;
    if (userClaimsWithMeta && userClaimsWithMeta.length > 0) {
      let claimsLeftToMake = 0;
      userClaimsWithMeta.forEach(function(uc){
        claimsLeftToMake +=  uc.totalRedeemed - uc.claimsMade.length;
      });
      if (claimsLeftToMake > 0) {
      claimButton = <Button className='connect-button claim-button' onClick={this.props.openPendingClaimDialog}>
       {claimsLeftToMake} redeemable items
       <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={renderClaimHelpTooltip}
          >
        <FontAwesomeIcon icon={faInfoCircle}/>
        </OverlayTrigger>
      </Button>
      }
    }
    let userBalanceClaim = <span />;
    if (selectedAddress && selectedAddress.length > 0) {
      connectButton =
      (<AddressButton address={selectedAddress} onClick={this.props.disconnectWallet}/>)
      if (products.length > 0) {
      userBalanceClaim = (
        <div className="token-balance-row">
          <div className="token-balance-label">
            Balance
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={renderBalanceHelpTooltip}
              >
            <FontAwesomeIcon icon={faInfoCircle}/>
            </OverlayTrigger>
          </div>
          {products.map(function(pItem){
            let userBalance = 0;
            if (pItem.userBalance) {
              userBalance = Math.floor(Number(pItem.userBalance))
            }
           return <div className="token-balance-column">{pItem.tokenSymbol} {userBalance}</div>
          })}
        </div>
        )
      }
    } else {
      connectButton =
      (<div>
        <Button className='connect-button' onClick={this.props.connectToWallet}>
          Connect Wallet <FontAwesomeIcon icon={faArrowCircleRight} className="connect-icon" />
        </Button>
      </div>)
    }
    if (isNonEmptyString(transactionStatus)) {
      let statusMessage = ''
      if (transactionStatus === 'pendingApproval') {
        statusMessage = <div className="pending"><FontAwesomeIcon icon={faSpinner} spin/>Waiting for user approval</div>;
      } else if (transactionStatus === 'waitingConfirmation') {
        statusMessage = <div className="pending"><FontAwesomeIcon icon={faSpinner} spin/>Waiting for tx confirmation</div>;
      } else if (transactionStatus === 'successConfirmation') {
        statusMessage = <div className="success"><FontAwesomeIcon icon={faCheck} /> Transaction succeeded</div>;
      } else if (transactionStatus === 'failedApproval') {
        statusMessage = <div className="fail"><FontAwesomeIcon icon={faTimes} /> Approval denied</div>
      } else if (transactionStatus === 'failedTransaction') {
        statusMessage =  <div className="fail"><FontAwesomeIcon icon={faTimes} /> Transaction failed</div>
      }
      transactionStatusButton = <div className="transaction-status-btn">{statusMessage}</div>
    }
    let nftClaimButton = <span />;
    if (userNftClaims && userNftClaims.length > 0) {
      const userNftClaimsMap = [];
      const self = this;
      userNftClaims.forEach(function(item, idx){
        const nftClaimRowExists = userNftClaimsMap.find((i) => (i.token === item.token));
        if (nftClaimRowExists) {
          nftClaimRowExists.total = nftClaimRowExists.total + 1;
        } else {
          userNftClaimsMap.push({'token': item.token, 'total': 1, 'nftLink': item.link});
        }
      });
      nftClaimButton = (
        <div className="token-balance-row">
          <div className="token-balance-label">
            NFTees
          </div>
          {userNftClaimsMap.map(function(pItem){
           return <div className="token-balance-column" onClick={() => self.gotoClaimsPage(pItem)}>{pItem.token} {pItem.total}</div>
          })}

        </div>
      )
    }
    return (
      <Navbar expand="lg" className="nav-container">
        <Navbar.Brand href="#">
          <span className="bancor-pre-logo">&#128085;</span><img src={bancorLogo} className="bancor-logo-img" alt="logo"/>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {userBalanceClaim}
          {nftClaimButton}
          {claimButton}
          {transactionStatusButton}
          {connectButton}
        </Navbar.Collapse>
      </Navbar>
      )
  }
}
