import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  reconnect,
  type Config,
  type ReconnectReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
import { normalizeHookError } from "./error.js";

export type UseReconnectParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<ReconnectReturnType, Error, void, unknown>,
    "mutationFn"
  >;
};

export type UseReconnectReturnType = UseMutationResult<
  ReconnectReturnType,
  Error,
  void,
  unknown
>;

export function useReconnect(
  parameters: UseReconnectParameters = {}
): UseReconnectReturnType {
  const contextConfig = useConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async () => {
      try {
        return await reconnect(config);
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
