/**
 * @fileoverview Hardhat configuration file.
 * Configures Solidity compiler, enables mainnet forking for testing, 
 * and sets up network details for development environments.
 * * Pre-requisites: 
 * - Environment variable MAINNET_PROVIDER_URL (e.g., Alchemy/Infura node URL)
 * - Environment variable DEV_ETH_MNEMONIC (24-word development mnemonic)
 */

// Load Hardhat plugins
require('@nomiclabs/hardhat-web3');
require('@nomiclabs/hardhat-ethers'); 
// No need to require 'ethers' globally; Hardhat provides it.

// --- CONFIGURATION VARIABLES ---
const providerUrl = process.env.MAINNET_PROVIDER_URL;
const developmentMnemonic = process.env.DEV_ETH_MNEMONIC;

/**
 * Generates an array of private keys from a mnemonic phrase.
 * This function is necessary for network configurations (like 'localhost') 
 * that explicitly require private keys rather than a mnemonic.
 * @param {string} mnemonic - The 12/24-word seed phrase.
 * @param {number} numberOfPrivateKeys - The number of keys to generate (default 20).
 * @returns {string[]} An array of generated private keys.
 */
function getPrivateKeysFromMnemonic(mnemonic, numberOfPrivateKeys = 20) {
  const result = [];
  // Use Hardhat's internal Ethers dependency (accessible via 'ethers' helper in global scope if needed)
  // Since this is in the config file, we rely on the previously required '@nomiclabs/hardhat-ethers' for 'ethers' to be available.
  const { ethers } = require("hardhat"); // Safely access Ethers within Hardhat environment
  
  for (let i = 0; i < numberOfPrivateKeys; i++) {
    // CRITICAL FIX: Ensure the private key derivation is correct and results are returned.
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
    result.push(wallet.privateKey);
  }
  return result; // CRITICAL FIX: Must return the array of keys.
}

// --- HARDHAT EXPORT CONFIG ---
module.exports = {
  // Solidity Compiler Settings
  solidity: {
    version: '0.8.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000 // A higher run count is generally better for production-ready code.
      }
    }
  },

  // Network Configuration
  networks: {
    // 1. hardhat (Default in-memory local network with Mainnet Forking)
    hardhat: {
      // Input validation is handled implicitly by Hardhat when accessing 'providerUrl'.
      // Hardhat will throw a clear error if 'providerUrl' is undefined upon forking attempt.
      forking: {
        url: providerUrl || "", // Use empty string if undefined; let Hardhat throw the error.
        enabled: providerUrl !== undefined, // Explicitly control forking
      },
      // Gas settings optimized for local development/testing
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      loggingEnabled: false,
      // Use the mnemonic directly for account management (Hardhat's preferred way)
      accounts: {
        mnemonic: developmentMnemonic,
      },
      // Chain ID must be 1 for Mainnet forking to be seamless with Metamask
      chainId: 1, 
    },

    // 2. localhost (External local network, often started via 'npx hardhat node')
    localhost: {
      url: 'http://localhost:8545',
      // Get array of private keys derived from the mnemonic for the external node.
      // This requires the external node (e.g., 'hardhat node' command) to be started 
      // with the same mnemonic/accounts.
      accounts: developmentMnemonic 
        ? getPrivateKeysFromMnemonic(developmentMnemonic)
        : [], // Fallback to empty array if mnemonic is missing
    }
  },
};
