import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  writeContract,
  type Config,
  type WriteContractParameters,
  type WriteContractReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
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

export type UseWriteContractReturnType = ReturnType<
  typeof useMutation<WriteContractReturnType, Error, WriteContractParameters, unknown>
>;

export function useWriteContract(
  parameters: UseWriteContractParameters = {}
): UseWriteContractReturnType {
  const contextConfig = useIvemConfig();
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
