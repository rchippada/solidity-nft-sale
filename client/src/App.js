import React, { Component, useState } from 'react'
import Web3 from 'web3'

import './App.css';

import spacebearKyc from "./contracts/SpacebearKyc.json";
import spacebearSale from "./contracts/SpacebearSale.json";

import detectEthereumProvider from '@metamask/detect-provider';

class App extends Component {
  state = {loaded: false, buyer_address: "", stats: ""};

  // Create web3 provider and smart contract instance as the component is mounting
  componentDidMount = async() => {
    try {
      this.accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      this.deployer_account = this.accounts[0];

      const provider = await detectEthereumProvider();     
      this.web3 = new Web3(provider);

      this.networkId = await this.web3.eth.net.getId();

      this.spacebearKycInst = new this.web3.eth.Contract( 
        spacebearKyc.abi,
        spacebearKyc.networks[this.networkId].address
      );

      this.spacebearSaleInst = new this.web3.eth.Contract( 
        spacebearSale.abi,
        spacebearSale.networks[this.networkId].address
      );

      this.spacebearSaleInstAddress = this.spacebearSaleInst._address;

      this.availableNfts = await this.spacebearSaleInst.methods.getAvailableNftImages().call();

      this.listenToPurchasedEvents();

      this.setState({ loaded: true }, this.updateUserStatsDisplay);
    } catch (error) {
      alert("Failed to load Web3, accounts, and contracts. ", JSON.stringify(error));
    }
  }

  updateUserStatsDisplay = async() => {
    if (this.state.buyer_address !== "") {
      let stats = await this.spacebearSaleInst.methods.getOwnershipStats(this.state.buyer_address).call({from: this.deployer_account});
      this.setState({["stats"]: stats.toString()});
    }
  }

  listenToPurchasedEvents = async() => {
    this.spacebearSaleInst.events.Purchased({to: this.deployer_account}).on("data", this.updateUserStatsDisplay);
  }

  handleBuyerAccountInput = (event) => {
    const target = event.target;
    const name = target.name;

    this.setState({[name]: target.value});
    this.setState({["stats"]: 0});
  }

  handleNftSelectionSubmit = async(event) => {
    const target = event.target;
    const name = target.name;

    await this.spacebearKycInst.methods.setApproval(this.state.buyer_address, parseInt(name)).send({from: this.deployer_account});
    
    this.updateUserStatsDisplay();
    alert("Congrats. You can now buy your NFT.");
  }

  // Render the app
  render() {
    if(!this.state.loaded) {
      return <div>Loading Web3, accounts, and contracts</div>
    }
    return (
      <div className="App">
        <h1>Welcome to Spacebear NFT Sale dApp</h1><br/>

        <h2>Which Spacebear do you want?</h2>
        <div>Enter your address to get started: <input type="text" name="buyer_address" value={this.state.buyer_address} onChange={this.handleBuyerAccountInput}></input>
          <br/><br/>            
            {this.availableNfts.map((url, i) => (
              <button type="button" key={i} name={i} onClick={this.handleNftSelectionSubmit}>
                <img src = {url} name={i} height="100" width="100"></img>
              </button>
            ))}
        </div>

        <div>
          <br/><h2>Each NFT costs 0.1 ether</h2>
          <p>To buy your NFT, send the amount to this address <b>{this.spacebearSaleInstAddress}</b></p>
        </div>

        <div>
          <br/><h3>Your current accumulations: {this.state.stats} </h3><br/>
        </div>
      </div>
    );
  }
}

export default App;
