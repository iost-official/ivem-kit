import type { Chain } from "../types/index.js";

export const mainnet: Chain = {
  id: "iost-mainnet",
  name: "IOST Mainnet",
  network: "mainnet",
  rpcUrls: ["https://api.iost.io"],
};

/**
 * @deprecated
 * @description IOST testnet is currently unavailable. The exported testnet chain is kept for compatibility only.
 */
export const testnet: Chain = {
  id: "iost-testnet",
  name: "IOST Testnet",
  network: "testnet",
  rpcUrls: ["https://api.testnet.iost.io"],
};
