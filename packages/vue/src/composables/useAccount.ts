import { ref, watchEffect, onUnmounted, type Ref } from "vue";
import { getAccount, type GetAccountReturnType } from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";

export type UseAccountReturnType = Ref<GetAccountReturnType>;

export function useAccount(): UseAccountReturnType {
  const config = useIvemConfig();
  const account = ref<GetAccountReturnType>(getAccount(config));

  const unsubscribe = config.subscribe(
    (state) => ({
      address: state.accounts[0],
      addresses: state.accounts,
      chainId: state.chainId,
      status: state.status,
    }),
    () => {
      account.value = getAccount(config);
    },
    {
      equalityFn: (a, b) =>
        a.address === b.address &&
        a.status === b.status &&
        a.chainId === b.chainId,
    }
  );

  onUnmounted(() => {
    unsubscribe();
  });

  return account;
}
