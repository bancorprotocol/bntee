import React, {Component} from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import './landing.scss'
import TopNavbar from '../nav/TopNavbar'
import Onboard from 'bnc-onboard'
import Web3 from 'web3'
import { getBuyReturnPrice, getSellReturnPrice} from '../../utils/BancorTrader';
import { getUserBalance } from '../../utils/CollateralToken';

import { isEmptyObject , isNonEmptyObject } from '../../utils/ObjectUtils';
import ProductDisplay from '../product/ProductDisplay'
import BuyTokenDialog from '../dialogs/BuyTokenDialog';
import SellTokenDialog from '../dialogs/SellTokenDialog';
import RedeemTokenDialog from '../dialogs/RedeemTokenDialog';

import ClaimProductDialog from '../dialogs/ClaimProductDialog';
import ThankYouDialog from '../dialogs/ThankYouDialog';
import PendingClaimDialog from '../dialogs/PendingClaimDialog';
import BuyTokenSuccessDialog from '../dialogs/BuyTokenSuccessDialog';

const API_URL = process.env.REACT_APP_API_URL;
const MAIN_NETWORK_ID = parseInt(process.env.REACT_APP_NETWORK_ID, 10);

export default class AppLanding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'currentView': 'image',
      'connectionToggle': false,
      'products': [],
      'currentProduct': {},
      'buyDialogVisible': false,
      'claimDialogVisible': false,
      'thankYouDialogVisible': false,
      'buyProduct': {},
      'sellDialogVisible': false,
      'sellProduct': {},
      'redeemDialogVisible': false,
      'redeemProduct': {},
       'returnPrice': {},
       'sellReturnPrice': {},
       'pendingClaimDialogVisible': false,
       'userCollateralBalance': 0,
       'buyTokenSuccessDialogVisible': false,
       'web3': {},
       'pendingBuyObject': {},
       'returnPriceFetching': false,
       'accountToggle': false,
    }
  }
  componentWillMount() {
    this.props.getProductList();
    if (window.web3 && window.web3.currentProvider) {
      const walletAddress = window.web3.currentProvider.selectedAddress;
      if (walletAddress) {
        this.props.fetchUserClaims(walletAddress)
      }
    }
    const self = this;
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', function (accounts) {
        self.setState({'accountToggle': true});
       self.props.getProductList();
      })
    }
  }
  
  onboard = () => {
    const self = this;
    const onboard = Onboard({
    dappId: process.env.REACT_APP_BN_API, 
    networkId: MAIN_NETWORK_ID,
    subscriptions: {
       wallet: wallet => {
         const web3 = new Web3(wallet.provider);
         window.web3 = web3;
         self.setState({'web3': web3});
         self.refreshApplicationState();
       }
      }
    });
    return onboard;
  }

  connectToWallet = () => {
    const self = this;
    const onboard = this.onboard()
    async function selectWallet() {
      try {

      await onboard.walletSelect()
      await onboard.walletCheck()
      self.setState({'connectionToggle': !self.state.connectionToggle});
      } catch(e) {
        console.log('Could not connect user')
      }
    }
    selectWallet()
  }
  
  disconnectWallet = () => {
    const onboard = this.onboard()    
    onboard.walletReset();
    window.web3 = null;
    this.setState({web3: {}});
    this.setState({'connectionToggle': !this.state.connectionToggle});
  }
  
  setCurrentProduct = (item) => {
    this.setState({'currentProduct': item})
  }
  openPendingClaimDialog = () => {
    this.setState({'pendingClaimDialogVisible': true})
  }
  componentDidUpdate(prevProps, prevState) {
    const { token: {products, userClaimsWithMeta},
      transaction: {redeemTokenTransaction, claimSubmitted, buyingToken,
        sellingToken, redeemingToken, 
      } } = this.props;
    if (
      (prevProps.token.productListFetching &&
      !this.props.token.productListFetching &&
      products.length > 0) ||
      (isEmptyObject(prevState.web3) && isNonEmptyObject(this.state.web3) && products.length > 0)) {
        this.setState({'accountToggle': false});
        this.props.getProductMeta(products);
        this.props.getProductPrices(products);
        this.props.getProductPastEvents(products);
        const windowWeb3 = window.web3;
        if (windowWeb3 && windowWeb3.currentProvider && windowWeb3.currentProvider.selectedAddress) {
          const userWalletAddress = windowWeb3.currentProvider.selectedAddress
          this.props.getUserWalletBalance(products);
          this.props.fetchUserClaims(userWalletAddress)
        }
    }
    
    if (isNonEmptyObject(this.state.web3)) {
      const {web3} = this.state;
      if (web3.currentProvider && web3.currentProvider.selectedAddress) {
        const walletAddress = web3.currentProvider.selectedAddress;
        if (isEmptyObject(prevState.web3)) {
          this.props.fetchUserClaims(walletAddress);
        } else if (prevState.web3.currentProvider && prevState.web3.currentProvider.selectedAddress){
          const prevWalletAddress = prevState.web3.currentProvider.selectedAddress;
          if (prevWalletAddress !== walletAddress) {
            window.web3 = web3;
            this.props.fetchUserClaims(walletAddress);
          }
        }
      }
    }

    if (!prevProps.transaction.claimSubmitted && claimSubmitted) {
      this.refreshApplicationState();
    }
    
    if (prevProps.transaction.redeemingToken && !redeemingToken) {
      this.props.getProductList();
    }
    if (prevProps.transaction.buyingToken && !buyingToken) {
      this.props.getProductList();
      this.setState({'buyTokenSuccessDialogVisible': true});
    }
    if (prevProps.transaction.sellingToken && !sellingToken) {
      this.props.getProductList();
    }
    if (prevProps.transaction.redeemingToken && !redeemingToken) {
      this.props.getProductList();
    }
    if (isEmptyObject(prevProps.transaction.redeemTokenTransaction) && isNonEmptyObject(redeemTokenTransaction)) {
      this.setState({'claimDialogVisible': true});
    }
    if (!prevProps.transaction.claimSubmitted && claimSubmitted) {
      this.setState({'thankYouDialogVisible': true});
    }
  }
  
  refreshApplicationState = () => {
    const { token: {products} } = this.props;
    this.props.getProductMeta(products);
    this.props.getProductPrices(products);
    this.props.getProductPastEvents(products);
    const windowWeb3 = window.web3;

    if (windowWeb3 && windowWeb3.currentProvider && windowWeb3.currentProvider.selectedAddress) {

      const userWalletAddress = windowWeb3.currentProvider.selectedAddress
      this.props.getUserWalletBalance(products);
      this.props.fetchUserClaims(userWalletAddress)
    }    
  }
  
  showBuyTokenDialog = (product) => {
    this.setState({'buyDialogVisible': true, 'buyProduct': product})
  }
  
  showSellTokenDialog = (product) => {
    this.setState({'sellDialogVisible': true, 'sellProduct': product})
  }
  
  showRedeemTokenDialog = (product) => {
    this.setState({'redeemDialogVisible': true, 'redeemProduct': product})    
  }
  
  hideBuyDialog = () => {
     this.setState({'buyDialogVisible': false, 'buyProduct': {}})   
  }
  
  hideRedeemDialog = () => {
    this.setState({'redeemDialogVisible': false});
  }
  buyToken = (product, collateral, amount, amountReserve) => {
    this.setState({
      pendingBuyObject: {
        'tokenSymbol': product.tokenSymbol,
        'amount': amountReserve
      }
    })
    this.props.buyToken(product, collateral, amount);
  }
  
  sellToken = (product, collateral, amount) => {
    this.props.sellToken(product, collateral, amount)    
  }
  
  redeemToken = (product, amount) => {
    const currentProvider = window.web3 ? window.web3.currentProvider : null;
    const web3 = new Web3(currentProvider);
    this.props.redeemProductToken(web3, product, amount)
  }
  hideSellDialog = () => {
    this.setState({'sellDialogVisible': false, sellProduct: {}})
  }
  
  resetReturnPrice = () => {
    this.setState({
      returnPrice: {},
      buyProduct: {},
      sellProduct: {},
      redeemProduct: {}
    })
  }

  getUpdatedPurchasePrice = (product, collateral, amount) => {
    const self = this;
    if (!isNaN(amount) && amount > 0) {
    this.setState({'returnPriceFetching': true, 'returnPrice': ''})    
    getBuyReturnPrice( product, collateral, amount).then(function(amountResponse){
      self.setState({'returnPrice': amountResponse, 'returnPriceFetching': false})
    })
    }
  }
  
  getLatestPrice = (product, collateral, amount) => {
    const self = this;
    if (!isNaN(amount) && amount > 0) {    
      this.setState({'returnPriceFetching': true});
      return getBuyReturnPrice( product, collateral, amount).then(function(amountResponse){
        self.setState({'returnPrice': amountResponse, 'returnPriceFetching': false});
        return amountResponse;
      })
    }
  }
  
  getUpdatedSellPrice = (product, collateral, amount) => {
    const self = this;
    if (!isNaN(amount) && amount > 0) {
      this.setState({'returnPriceFetching': true, 'sellReturnPrice': ''})   
      getSellReturnPrice( product, collateral, amount).then(function(amountResponse){
        self.setState({'sellReturnPrice': amountResponse, 'returnPriceFetching': false})
      })
    }    
  }
  
  fetchUserBalance = (collateral) => {
    const currentProvider = window.web3 ? window.web3.currentProvider : null;
    if (currentProvider && currentProvider.selectedAddress && collateral.address) {
      const self = this;
      const web3 = new Web3(currentProvider);      
      getUserBalance(web3, collateral).then(function(userCollateralBalance){
        self.setState({'userCollateralBalance': userCollateralBalance});
      })
    }
  }
  
  hideClaimTokenDialog = () => {
    this.setState({claimDialogVisible: false});
  }
  
  hideThankYouDialog = () => {
    this.setState({'thankYouDialogVisible': false});
  }
  
  hidePendingClaimDialog = () => {
    this.setState({'pendingClaimDialogVisible': false});
  }
  
  makeClaimToProject = (product, transaction) => {
    this.setState({'claimDialogVisible': true, redeemProduct: product, pendingClaimDialogVisible: false,
      claimTransaction: transaction
    });
  }
  
  hideBuyTokenSuccessDialog = () => {
    this.setState({
      'buyTokenSuccessDialogVisible': false,
    })
  }
  
  render() {
    const {token: {products, userClaimsWithMeta}, transaction: {redeemTokenTransaction, transactionStatus, productClaim,
      buyTokenTransaction
    }} = this.props;
    const {buyProduct, buyDialogVisible, returnPrice, redeemProduct, sellProduct, sellReturnPrice,
    sellDialogVisible, redeemDialogVisible, claimDialogVisible, thankYouDialogVisible, userCollateralBalance,
      pendingClaimDialogVisible, buyTokenSuccessDialogVisible, pendingBuyObject, returnPriceFetching,
      accountToggle,
    } = this.state;
    const currentProvider = window.web3 ? window.web3.currentProvider : null
    let selectedAddress = null;

    const self = this;
    if (currentProvider && currentProvider.selectedAddress) {
      selectedAddress = currentProvider.selectedAddress
    }
    let productDescriptionList = <span/>;
    if (products && products.length > 0) {
      productDescriptionList = products.map(function(currentProduct, idx) {
        return (
          <Col lg={4} sm={6} xs={12} key={`${currentProduct.productName}-${idx}`}>
            <div className="product-menu-btn-container">
              <div className={`product-menu-btn`}>
              {currentProduct.tokenSymbol}
              </div>
            </div>
            <ProductDisplay currentProduct={currentProduct} showBuyTokenDialog={self.showBuyTokenDialog} sellToken={self.showSellTokenDialog}
            redeemToken={self.showRedeemTokenDialog}/>
          </Col>
        )
      })
    }
    return (
      <div>
      <TopNavbar connectToWallet={this.connectToWallet} selectedAddress={selectedAddress}
        transactionStatus={transactionStatus} userClaimsWithMeta={userClaimsWithMeta}
        openPendingClaimDialog={this.openPendingClaimDialog} products={products}/>
      <Container fluid className="landing-container-fluid">
      
      <div className="app-main-container">
        <BuyTokenSuccessDialog buyTokenSuccessDialogVisible={buyTokenSuccessDialogVisible}
          onHide={this.hideBuyTokenSuccessDialog} buyTokenTransaction={buyTokenTransaction}
          products={products}
          />
        <PendingClaimDialog userClaimsWithMeta={userClaimsWithMeta} onHide={this.hidePendingClaimDialog}
          pendingClaimDialogVisible={pendingClaimDialogVisible} makeClaimToProject={this.makeClaimToProject}/>
        <ClaimProductDialog claimDialogVisible={claimDialogVisible}
          submitProductClaim={this.props.submitProductClaim} redeemProduct={redeemProduct}
          transaction={redeemTokenTransaction} onHide={this.hideClaimTokenDialog}/>
        <ThankYouDialog thankYouDialogVisible={thankYouDialogVisible} onHide={this.hideThankYouDialog} productClaim={productClaim}/>
        <BuyTokenDialog buyToken={this.buyToken} getLatestPrice={this.getLatestPrice}
          buyProduct={buyProduct} buyDialogVisible={buyDialogVisible}
          getUpdatedPurchasePrice={this.getUpdatedPurchasePrice} web3={window.web3}
          fetchUserBalance={this.fetchUserBalance} userCollateralBalance={userCollateralBalance}
          returnPrice={returnPrice} onHide={this.hideBuyDialog} returnPriceFetching={returnPriceFetching}
          connectToWallet={this.connectToWallet} resetReturnPrice={this.resetReturnPrice}
          accountToggle={accountToggle}/>
        <SellTokenDialog sellToken={this.sellToken}
          sellProduct={sellProduct} sellDialogVisible={sellDialogVisible} getUpdatedSellPrice={this.getUpdatedSellPrice}
          returnPrice={sellReturnPrice} onHide={this.hideSellDialog}
          resetReturnPrice={this.resetReturnPrice} returnPriceFetching={returnPriceFetching}
          accountToggle={accountToggle}/>
        <RedeemTokenDialog redeemToken={this.redeemToken}
          redeemProduct={redeemProduct} redeemDialogVisible={redeemDialogVisible}
          onHide={this.hideRedeemDialog} accountToggle={accountToggle}/>
        <Row className="product-list-container">
        {productDescriptionList}
        </Row>
        </div>
      </Container>
      </div>
      )
  }
}