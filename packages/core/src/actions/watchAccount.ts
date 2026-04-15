import type { Config } from "../createConfig.js";
import { getAccount, type GetAccountReturnType } from "./getAccount.js";

export type WatchAccountParameters = {
  onChange(
    account: GetAccountReturnType,
    prevAccount: GetAccountReturnType
  ): void;
};

export type WatchAccountReturnType = () => void;

export function watchAccount(
  config: Config,
  parameters: WatchAccountParameters
): WatchAccountReturnType {
  const { onChange } = parameters;

  return config.subscribe(() => getAccount(config), onChange, {
    equalityFn: (a, b) => a.status === b.status && a.address === b.address,
  });
}
