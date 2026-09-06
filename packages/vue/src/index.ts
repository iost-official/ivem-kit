// Plugin
export {
  IvemPlugin,
  useIvemConfig,
  IvemConfigKey,
  type IvemPluginOptions,
} from "./plugin.js";

// Composables
export {
  useAccount,
  type UseAccountReturnType,
} from "./composables/useAccount.js";
export {
  useConnect,
  type UseConnectParameters,
  type UseConnectReturnType,
} from "./composables/useConnect.js";
export {
  useReconnect,
  type UseReconnectParameters,
  type UseReconnectReturnType,
} from "./composables/useReconnect.js";
export {
  useDisconnect,
  type UseDisconnectParameters,
  type UseDisconnectReturnType,
} from "./composables/useDisconnect.js";
export {
  useChainId,
  type UseChainIdReturnType,
} from "./composables/useChainId.js";
export {
  useSignMessage,
  type UseSignMessageParameters,
  type UseSignMessageReturnType,
} from "./composables/useSignMessage.js";
export {
  useSendTransaction,
  type UseSendTransactionParameters,
  type UseSendTransactionReturnType,
} from "./composables/useSendTransaction.js";
export {
  useWriteContract,
  type UseWriteContractParameters,
  type UseWriteContractReturnType,
} from "./composables/useWriteContract.js";
export {
  useCallContract,
  type UseCallContractParameters,
  type UseCallContractReturnType,
} from "./composables/useCallContract.js";
export {
  useWaitForTransactionReceipt,
  type UseWaitForTransactionReceiptParameters,
  type UseWaitForTransactionReceiptReturnType,
} from "./composables/useWaitForTransactionReceipt.js";

// Re-export common core entry points explicitly for app-level imports.
export {
  createConfig,
  iwallet,
  mainnet,
  testnet,
  IWALLET_INITIALIZED_EVENT,
  IWALLET_PROVIDER_TIMEOUT,
  getIWalletProvider,
  waitForIWalletProvider,
  watchIWalletProvider,
  type CreateConfigParameters,
  type Config,
  type IWalletParameters,
} from "@ivem/kit";

// Re-export remaining core types and functions.
export type * from "@ivem/kit";
export * from "@ivem/kit";
