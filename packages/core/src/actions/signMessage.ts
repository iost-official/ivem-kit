import type { Config } from "../createConfig.js";
import { getIvemWalletClient } from "../internal/getIvemWalletClient.js";

export type SignMessageParameters = {
  message: string | object;
  account?: string;
};

export type SignMessageReturnType = unknown;

export async function signMessage(
  config: Config,
  parameters: SignMessageParameters
): Promise<SignMessageReturnType> {
  const walletClient = await getIvemWalletClient(config);
  const message =
    typeof parameters.message === "string"
      ? parameters.message
      : JSON.stringify(parameters.message);
  return walletClient.signMessage(message);
}
