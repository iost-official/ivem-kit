import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  callContract,
  type Config,
  type CallContractParameters,
  type CallContractReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
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

export type UseCallContractReturnType = ReturnType<
  typeof useMutation<CallContractReturnType, Error, CallContractParameters, unknown>
>;

export function useCallContract(
  parameters: UseCallContractParameters = {}
): UseCallContractReturnType {
  const contextConfig = useIvemConfig();
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
