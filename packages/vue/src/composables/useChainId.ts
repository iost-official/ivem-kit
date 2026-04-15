import { ref, onUnmounted, type Ref } from "vue";
import { getChainId } from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";

export type UseChainIdReturnType = Ref<string>;

export function useChainId(): UseChainIdReturnType {
  const config = useIvemConfig();
  const chainId = ref<string>(getChainId(config));

  const unsubscribe = config.subscribe(
    (state) => state.chainId,
    () => {
      chainId.value = getChainId(config);
    }
  );

  onUnmounted(() => {
    unsubscribe();
  });

  return chainId;
}
