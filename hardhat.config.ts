import "@nomicfoundation/hardhat-toolbox";
import type { HardhatUserConfig } from "hardhat/config";

const baseSepoliaRpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
const deployerPrivateKey = process.env.CONTRACT_PRIVATE_KEY;

const networks: HardhatUserConfig["networks"] = {};

if (baseSepoliaRpcUrl && deployerPrivateKey) {
  networks.baseSepolia = {
    url: baseSepoliaRpcUrl,
    chainId: 84532,
    accounts: [deployerPrivateKey],
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
};

export default config;
