import type { Config } from "../createConfig.js";
import { getIvemWalletClient } from "../internal/getIvemWalletClient.js";

export type SendTransactionParameters = {
  token?: string;
  from?: string;
  to: string;
  amount: string;
  memo?: string;
};

export type SendTransactionReturnType = {
  hash: string;
};

export async function sendTransaction(
  config: Config,
  parameters: SendTransactionParameters
): Promise<SendTransactionReturnType> {
  const { token = "iost", from, to, amount, memo } = parameters;
  const walletClient = await getIvemWalletClient(config);

  const result = await walletClient.transfer({
    token,
    from: from ?? config.state.accounts[0],
    to,
    amount,
    memo: memo ?? "",
  });

  return { hash: typeof result?.hash === "string" ? result.hash : "" };
}
