import {
  createPublicClient,
  http,
  type TxReceipt,
} from "@ivem/core";
import type { Config } from "../createConfig.js";

type PublicClient = ReturnType<typeof createPublicClient>;

const publicClientCache = new WeakMap<
  Config,
  {
    chainId: string;
    client: PublicClient;
  }
>();

export type WaitForTransactionReceiptParameters = {
  hash: string;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  stage?: "executed" | "irreversible";
};

export type WaitForTransactionReceiptReturnType = TxReceipt;

export async function waitForTransactionReceipt(
  config: Config,
  parameters: WaitForTransactionReceiptParameters
): Promise<WaitForTransactionReceiptReturnType> {
  const chain =
    config.chains.find((item) => item.id === config.state.chainId) ??
    config.chains[0];

  if (!chain) {
    throw new Error("No chain configured");
  }

  // Reuse cached public client when chainId hasn't changed.
  const cached = publicClientCache.get(config);
  let publicClient =
    cached?.chainId === chain.id ? cached.client : undefined;

  if (!publicClient) {
    publicClient = createPublicClient({
      chain: {
        id: chain.id,
        name: chain.name,
        rpcUrls: chain.rpcUrls,
      },
      transport: http(),
    });
    publicClientCache.set(config, {
      chainId: chain.id,
      client: publicClient,
    });
  }

  return publicClient.waitForTransactionReceipt(
    parameters
  ) as Promise<WaitForTransactionReceiptReturnType>;
}
