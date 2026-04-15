import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  disconnect,
  type Config,
  type DisconnectReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseDisconnectParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<DisconnectReturnType, Error, void, unknown>,
    "mutationFn"
  >;
};

export type UseDisconnectReturnType = UseMutationResult<
  DisconnectReturnType,
  Error,
  void,
  unknown
>;

export function useDisconnect(
  parameters: UseDisconnectParameters = {}
): UseDisconnectReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async () => {
      try {
        return await disconnect(config);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
