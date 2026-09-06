import type { Config } from "../createConfig.js";
import { IWALLET_PROVIDER_TIMEOUT } from "../utils/getIWalletProvider.js";

export type ReconnectReturnType = {
  accounts: readonly string[];
  chainId: string;
} | null;

export async function reconnect(config: Config): Promise<ReconnectReturnType> {
  const connector = config.connector;
  await connector.getProvider({ timeout: IWALLET_PROVIDER_TIMEOUT });
  const isAuthorized = await connector.isAuthorized();

  if (!isAuthorized) {
    config.setState((x) => ({
      ...x,
      accounts: [],
      status: "disconnected",
      current: null,
    }));
    return null;
  }

  config.setState((x) => ({ ...x, status: "reconnecting" }));

  try {
    const accounts = await connector.getAccounts();
    const chainId = await connector.getChainId();

    if (accounts.length === 0) {
      config.setState((x) => ({ ...x, status: "disconnected", current: null }));
      return null;
    }

    const nextState = {
      accounts,
      chainId,
      status: "connected" as const,
      current: connector.uid,
    };

    config.setState(nextState);
    return { accounts, chainId };
  } catch {
    config.setState((x) => ({ ...x, status: "disconnected", current: null }));
    return null;
  }
}
