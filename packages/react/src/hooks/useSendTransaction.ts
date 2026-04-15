import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  sendTransaction,
  type Config,
  type SendTransactionParameters,
  type SendTransactionReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseSendTransactionParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<
      SendTransactionReturnType,
      Error,
      SendTransactionParameters,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseSendTransactionReturnType = UseMutationResult<
  SendTransactionReturnType,
  Error,
  SendTransactionParameters,
  unknown
>;

export function useSendTransaction(
  parameters: UseSendTransactionParameters = {}
): UseSendTransactionReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async (params) => {
      try {
        return await sendTransaction(config, params);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
