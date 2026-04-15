import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  signMessage,
  type Config,
  type SignMessageParameters,
  type SignMessageReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
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

export type UseSignMessageReturnType = ReturnType<
  typeof useMutation<SignMessageReturnType, Error, SignMessageParameters, unknown>
>;

export function useSignMessage(
  parameters: UseSignMessageParameters = {}
): UseSignMessageReturnType {
  const contextConfig = useIvemConfig();
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
