import type { Config } from "../createConfig.js";

export type GetChainIdReturnType = string;

export function getChainId(config: Config): GetChainIdReturnType {
  return config.state.chainId;
}
