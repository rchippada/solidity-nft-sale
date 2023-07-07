require("dotenv").config({path: "../.env"});
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_build_directory: "../client/src/contracts",
  networks: {
    ganache: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    ganache_wallet: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: "http://127.0.0.1:8545"
        }),
      network_id: "*",
    },
    sepolia: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
        }),
      network_id: '11155111',
    },    
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.18",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: process.env.ETHER_SCAN_KEY
  },
};
  
