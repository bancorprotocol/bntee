var BNTeeContract = artifacts.require("BNTeeToken");
var BNVTContract = artifacts.require("BNVTToken");
var BNLMContract = artifacts.require("BNLMToken");

module.exports = function(deployer, network, accounts) {
  // deployment steps
  deployer.deploy(BNTeeContract, accounts[0]);
  deployer.deploy(BNVTContract, accounts[0]);
  deployer.deploy(BNLMContract, accounts[0]);  
};