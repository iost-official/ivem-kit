import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import {
  waitForTransactionReceipt,
  type WaitForTransactionReceiptReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
import { normalizeHookError } from "./error.js";

export type UseWaitForTransactionReceiptParameters = {
  hash?: MaybeRefOrGetter<string | undefined>;
  retryCount?: MaybeRefOrGetter<number | undefined>;
  retryDelay?: MaybeRefOrGetter<number | undefined>;
  timeout?: MaybeRefOrGetter<number | undefined>;
  stage?: MaybeRefOrGetter<"executed" | "irreversible" | undefined>;
  enabled?: MaybeRefOrGetter<boolean | undefined>;
};

export type UseWaitForTransactionReceiptReturnType = {
  data: Ref<WaitForTransactionReceiptReturnType | null>;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
  isError: Ref<boolean>;
  refetch: () => Promise<WaitForTransactionReceiptReturnType | null>;
};

export function useWaitForTransactionReceipt(
  parameters: UseWaitForTransactionReceiptParameters = {}
): UseWaitForTransactionReceiptReturnType {
  const config = useIvemConfig();

  const query = useQuery({
    queryKey: computed(() => [
      "waitForTransactionReceipt",
      config.state.chainId,
      toValue(parameters.hash),
      toValue(parameters.retryCount),
      toValue(parameters.retryDelay),
      toValue(parameters.timeout),
      toValue(parameters.stage),
    ]),
    enabled: computed(() => {
      const hash = toValue(parameters.hash);
      const enabled = toValue(parameters.enabled);
      return Boolean(hash) && enabled !== false;
    }),
    queryFn: async () => {
      try {
        return await waitForTransactionReceipt(config, {
          hash: toValue(parameters.hash) ?? "",
          retryCount: toValue(parameters.retryCount),
          retryDelay: toValue(parameters.retryDelay),
          timeout: toValue(parameters.timeout),
          stage: toValue(parameters.stage),
        });
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });

  return {
    data: computed(
      () =>
        (query.data.value as WaitForTransactionReceiptReturnType | undefined) ??
        null
    ),
    error: computed(() => (query.error.value as Error | null) ?? null),
    isLoading: computed(() => query.isLoading.value || query.isFetching.value),
    isSuccess: computed(() => query.isSuccess.value),
    isError: computed(() => query.isError.value),
    refetch: async () => {
      const result = await query.refetch();
      return (result.data as WaitForTransactionReceiptReturnType | undefined) ?? null;
    },
  };
}
