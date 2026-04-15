import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";
import { getChainId } from "@ivem/kit";
import { useConfig } from "./useConfig.js";

export type UseChainIdReturnType = string;

export function useChainId(): UseChainIdReturnType {
  const config = useConfig();

  const chainId = useSyncExternalStore(
    (onChange) => {
      return config.subscribe(
        (state) => state.chainId,
        () => onChange()
      );
    },
    () => getChainId(config),
    () => getChainId(config)
  );

  return chainId;
}
