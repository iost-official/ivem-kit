import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  callContract,
  type Config,
  type CallContractParameters,
  type CallContractReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseCallContractParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<
      CallContractReturnType,
      Error,
      CallContractParameters,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseCallContractReturnType = UseMutationResult<
  CallContractReturnType,
  Error,
  CallContractParameters,
  unknown
>;

export function useCallContract(
  parameters: UseCallContractParameters = {}
): UseCallContractReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async (params) => {
      try {
        return await callContract(config, params);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
