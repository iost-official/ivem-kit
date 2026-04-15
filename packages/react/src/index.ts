// Context
export {
  IvemProvider,
  IvemContext,
  type IvemProviderProps,
} from "./context.js";

// Hooks
export { useConfig } from "./hooks/useConfig.js";
export { useAccount, type UseAccountReturnType } from "./hooks/useAccount.js";
export {
  useConnect,
  type UseConnectParameters,
  type UseConnectReturnType,
} from "./hooks/useConnect.js";
export {
  useReconnect,
  type UseReconnectParameters,
  type UseReconnectReturnType,
} from "./hooks/useReconnect.js";
export {
  useDisconnect,
  type UseDisconnectParameters,
  type UseDisconnectReturnType,
} from "./hooks/useDisconnect.js";
export { useChainId, type UseChainIdReturnType } from "./hooks/useChainId.js";
export {
  useSignMessage,
  type UseSignMessageParameters,
  type UseSignMessageReturnType,
} from "./hooks/useSignMessage.js";
export {
  useSendTransaction,
  type UseSendTransactionParameters,
  type UseSendTransactionReturnType,
} from "./hooks/useSendTransaction.js";
export {
  useWriteContract,
  type UseWriteContractParameters,
  type UseWriteContractReturnType,
} from "./hooks/useWriteContract.js";
export {
  useCallContract,
  type UseCallContractParameters,
  type UseCallContractReturnType,
} from "./hooks/useCallContract.js";
export {
  useWaitForTransactionReceipt,
  type UseWaitForTransactionReceiptParameters,
  type UseWaitForTransactionReceiptReturnType,
} from "./hooks/useWaitForTransactionReceipt.js";

// Re-export common core entry points explicitly for app-level imports.
export {
  createConfig,
  iwallet,
  mainnet,
  testnet,
  type CreateConfigParameters,
  type Config,
  type IWalletParameters,
} from "@ivem/kit";

// Re-export remaining core types and functions.
export type * from "@ivem/kit";
export * from "@ivem/kit";
