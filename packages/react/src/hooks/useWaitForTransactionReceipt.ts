import { useQuery } from "@tanstack/react-query";
import {
  waitForTransactionReceipt,
  type WaitForTransactionReceiptParameters,
  type WaitForTransactionReceiptReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseWaitForTransactionReceiptParameters =
  WaitForTransactionReceiptParameters & {
    enabled?: boolean;
  };

export type UseWaitForTransactionReceiptReturnType = {
  data: WaitForTransactionReceiptReturnType | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<WaitForTransactionReceiptReturnType | null>;
};

export function useWaitForTransactionReceipt(
  parameters: UseWaitForTransactionReceiptParameters = { hash: "" }
): UseWaitForTransactionReceiptReturnType {
  const config = useConfig();
  const { hash = "", enabled = true, ...rest } = parameters;
  const { retryCount, retryDelay, timeout, stage } = rest;

  const query = useQuery({
    queryKey: [
      "waitForTransactionReceipt",
      config.state.chainId,
      hash,
      retryCount,
      retryDelay,
      timeout,
      stage,
    ],
    enabled: Boolean(hash) && enabled,
    queryFn: async () => {
      try {
        return await waitForTransactionReceipt(config, {
          hash,
          retryCount,
          retryDelay,
          timeout,
          stage,
        });
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });

  return {
    data:
      (query.data as WaitForTransactionReceiptReturnType | undefined) ?? null,
    error: (query.error as Error | null) ?? null,
    isLoading: query.isLoading || query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    refetch: async () => {
      const result = await query.refetch();
      return (result.data as WaitForTransactionReceiptReturnType | undefined) ?? null;
    },
  };
}
