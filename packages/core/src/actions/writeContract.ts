import type { TransactionParameters } from "@ivem/core";
import type { Config } from "../createConfig.js";
import { getIvemWalletClient } from "../internal/getIvemWalletClient.js";

export type WriteContractParameters = TransactionParameters & {
  account?: string;
};

export type WriteContractReturnType = {
  hash: string;
};

export async function writeContract(
  config: Config,
  parameters: WriteContractParameters
): Promise<WriteContractReturnType> {
  const walletClient = await getIvemWalletClient(config);
  const result = await walletClient.writeContract(parameters);

  return {
    hash: typeof result?.hash === "string" ? result.hash : "",
  };
}
