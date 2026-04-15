import type { Config } from "../createConfig.js";
import { getChainId } from "./getChainId.js";

export type WatchChainIdParameters = {
  onChange(chainId: string, prevChainId: string): void;
};

export type WatchChainIdReturnType = () => void;

export function watchChainId(
  config: Config,
  parameters: WatchChainIdParameters
): WatchChainIdReturnType {
  const { onChange } = parameters;

  return config.subscribe(() => getChainId(config), onChange);
}
