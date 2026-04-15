import {
  type WriteContractParameters,
  type WriteContractReturnType,
} from "./writeContract.js";
import type { Config } from "../createConfig.js";
import { getIvemWalletClient } from "../internal/getIvemWalletClient.js";

export type CallContractParameters = WriteContractParameters;
export type CallContractReturnType = WriteContractReturnType;

export async function callContract(
  config: Config,
  parameters: CallContractParameters
): Promise<CallContractReturnType> {
  const walletClient = await getIvemWalletClient(config);
  const result = await walletClient.callContract(parameters);

  return {
    hash: typeof result?.hash === "string" ? result.hash : "",
  };
}
