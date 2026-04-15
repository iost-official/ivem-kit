import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  signMessage,
  type Config,
  type SignMessageParameters,
  type SignMessageReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseSignMessageParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<
      SignMessageReturnType,
      Error,
      SignMessageParameters,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseSignMessageReturnType = UseMutationResult<
  SignMessageReturnType,
  Error,
  SignMessageParameters,
  unknown
>;

export function useSignMessage(
  parameters: UseSignMessageParameters = {}
): UseSignMessageReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async (params) => {
      try {
        return await signMessage(config, params);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
