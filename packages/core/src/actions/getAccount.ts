import type { Config } from "../createConfig.js";
import type { Account } from "../types/index.js";

export type GetAccountReturnType = {
  address: string | undefined;
  addresses: readonly string[];
  chainId: string;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  status: "connected" | "connecting" | "disconnected" | "reconnecting";
};

export function getAccount(config: Config): GetAccountReturnType {
  const state = config.state;

  return {
    address: state.accounts[0],
    addresses: state.accounts,
    chainId: state.chainId,
    isConnected: state.status === "connected",
    isConnecting: state.status === "connecting",
    isDisconnected: state.status === "disconnected",
    isReconnecting: state.status === "reconnecting",
    status: state.status,
  };
}
