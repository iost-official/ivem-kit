// Export shared types.
export type * from "./types/index.js";

// Export config creation utilities.
export {
  createConfig,
  type CreateConfigParameters,
  type Config,
} from "./createConfig.js";

// Export connectors.
export { iwallet, type IWalletParameters } from "./connectors/iwallet.js";
export {
  IWALLET_INITIALIZED_EVENT,
  IWALLET_PROVIDER_TIMEOUT,
  getIWalletProvider,
  waitForIWalletProvider,
  watchIWalletProvider,
  type WaitForIWalletProviderParameters,
  type WatchIWalletProviderParameters,
  type GetIWalletProviderFn,
} from "./utils/getIWalletProvider.js";

// Export chain definitions.
export { mainnet, testnet } from "./chains/index.js";

// Export utility helpers.
export {
  createStorage,
  getDefaultStorage,
  noopStorage,
} from "./utils/storage.js";
export { createEmitter } from "./utils/emitter.js";

// Export actions.
export * from "./actions/index.js";
