// truffle-config.js
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

/**
 * .env yang diperlukan:
 * PRIVATE_KEY=0x041fbbf1a83b2b23248f41f9eb5d1858fe06bc806d82fc9675c64b1d6467e595 // wajib
 * HOLESKY_RPC=https://ethereum-holesky.publicnode.com // opsional
 * INFURA_KEY=https://holesky.infura.io/v3/${INFURA_KEY} // opsional
 * ALCHEMY_KEY=https://eth-holesky.g.alchemy.com/v2/${ALCHEMY_KEY} // opsional
 */

const toNumber = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`[truffle-config] Missing required environment variable: ${name}`);
  }
  return v.trim();
}

function normalizedPrivateKey() {
  const pk = requireEnv('PRIVATE_KEY');
  return pk.startsWith('0x') ? pk : `0x${pk}`;
}

const GAS_PRICE_GWEI = toNumber(process.env.GAS_PRICE_GWEI, 2);
const DEFAULT_GAS_PRICE = GAS_PRICE_GWEI * 1e9;
const POLLING_INTERVAL = toNumber(process.env.POLLING_INTERVAL, 12000);

function createProvider(rpcUrl) {
  return new HDWalletProvider({
    privateKeys: [normalizedPrivateKey()],
    providerOrUrl: rpcUrl,
    pollingInterval: POLLING_INTERVAL,
  });
}

module.exports = {
  networkCheckTimeout: 2000000,

  networks: {
    dev: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    // Holesky via PublicNode
    holesky_publicnode: {
      provider: () => createProvider(process.env.HOLESKY_RPC || "https://ethereum-holesky.publicnode.com"),
      network_id: 17000,       // WAJIB → sudah benar
      gas: 8000000,
      gasPrice: DEFAULT_GAS_PRICE,
      confirmations: 2,
      timeoutBlocks: 1000,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: { enabled: true, runs: 200 },
      },
    },
  },
};
