import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js";
import type { GetAccountReturnType, State } from "@ivem/kit";
import { useConfig } from "./useConfig.js";

export type UseAccountReturnType = GetAccountReturnType;

export function useAccount(): UseAccountReturnType {
  const config = useConfig();

  const account = useSyncExternalStoreWithSelector(
    (onChange) =>
      config.subscribe(
        (state) => state,
        () => onChange()
      ),
    () => config.state,
    () => config.state,
    (state: State): GetAccountReturnType => ({
      address: state.accounts[0],
      addresses: state.accounts,
      chainId: state.chainId,
      isConnected: state.status === "connected",
      isConnecting: state.status === "connecting",
      isDisconnected: state.status === "disconnected",
      isReconnecting: state.status === "reconnecting",
      status: state.status,
    }),
    (a, b) =>
      a.address === b.address &&
      a.status === b.status &&
      a.chainId === b.chainId &&
      a.addresses.length === b.addresses.length
  );

  return account;
}
