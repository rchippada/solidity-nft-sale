# NFT Sale truffle smart contract and react client

* This repository can be used as a sample to build a Web3.0 dApp for ERC721 NFT Sale

* It consists of a contract named `Spacebear.sol` and a `SpacebearSale.sol` in `Solidity` using `truffle`.

* It also provides a simple `react` client application to interact with the smart contract to kyc Approve an nft buyer

* To use the dapp: deploy the truffle smart contracts, run client app and kyc approve a buyer account, send money to the nft sale contract from metamask.

## The Solidity smart contract

* The code for the smart contract and the associtated config files can be found in the `truffle` directory

* In a terminal:
  * npm install -g truffle; npm install -g ganache
  * Run `ganache`

* In another terminal:
  * cd <nft_sale_dir>; cp  .env.sample  .env
  * Update the MNEMONIC and INFURA_API_KEY env config parameters in the .env
  * cd truffle;  `npm install`
  * Execute `truffle console --network ganache`. You can use this environment to test migration script and tests.

* To test with the client app, use the `ganache_wallet` or a test network as configured in the `truffle-config.js`. (The truffle-config has configuration for the Sepolia network). See below for details about using `ganache_wallet` environment

* To use `ganache_wallet` environment
  * Add a custom network in Metamask for `ganache`. The RPC URL and Chain ID will be found in the terminal where you executed `ganache` command
  * Load the metamask accounts in the ganache network with funds. This can be performed by transferring funds from ganache to metamask accounts as described below
    * Run `truffle console --network ganache` (not ganache_wallet) in a terminal
    * Then execute commands such as: `await web3.eth.sendTransaction({from: "0x1234..this-is-an-account-from-ganache", to: "0x3456..this-is-the-metamask-account", value: web3.utils.toWei("10", "ether")});`
    * Exit out of the truffle console
  * Run `truffle console --network ganache_wallet`
    * `migrate` to deploy the contracts

* Running the migrate command results in building the smart contract json in the `client/contracts` folder, which can be used to connect the client with the smart contracts

## The React client app

* The included client app is very minimal in nature.

* The `App.js` file has the code to interact with the nft sale smart contract. 

* Run `npm install` and `npm start` commands to start the client at `http://localhost:3000`

* In the client, enter metamask accounts[1] and click on one of the Spacebears image button to get KYC approval

* Metamask will prompt to confirm the transaction.
  * **Make sure the `ganache` network is chosen and `accounts[0]` is selected in metamask**

* After KYC approval, the NFT purchase stats for this account will be shown. Send the wei to the NFT Sale Contract address shown in the UI as accounts[1] **from metamask**

## Troubleshooting
  * If there are issues running the test scenarios, use `migrate --reset` in truffle console

