import type { Config } from "../createConfig.js";

export type ConnectParameters = Record<string, never>;

export type ConnectReturnType = {
  accounts: readonly string[];
  chainId: string;
};

export async function connect(
  config: Config,
  parameters: ConnectParameters = {}
): Promise<ConnectReturnType> {
  const connector = config.connector;

  config.setState((x) => ({ ...x, status: "connecting" }));

  try {
    void parameters;
    const result = await connector.connect();

    config.setState((x) => ({
      ...x,
      accounts: result.accounts,
      chainId: result.chainId,
      status: "connected",
      current: connector.uid,
    }));

    return result;
  } catch (error) {
    config.setState((x) => ({ ...x, status: "disconnected" }));
    throw error;
  }
}
