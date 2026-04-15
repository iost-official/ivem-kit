import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  writeContract,
  type Config,
  type WriteContractParameters,
  type WriteContractReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseWriteContractParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<
      WriteContractReturnType,
      Error,
      WriteContractParameters,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseWriteContractReturnType = UseMutationResult<
  WriteContractReturnType,
  Error,
  WriteContractParameters,
  unknown
>;

export function useWriteContract(
  parameters: UseWriteContractParameters = {}
): UseWriteContractReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async (params) => {
      try {
        return await writeContract(config, params);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
