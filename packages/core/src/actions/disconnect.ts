import type { Config } from "../createConfig.js";

export type DisconnectReturnType = void;

export async function disconnect(
  config: Config
): Promise<DisconnectReturnType> {
  const connector = config.connector;
  await connector.disconnect();

  config.setState({
    accounts: [],
    chainId: config.chains[0].id,
    status: "disconnected",
    current: null,
  });
}
