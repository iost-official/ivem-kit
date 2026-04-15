import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  reconnect,
  type Config,
  type ReconnectReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
import { normalizeHookError } from "./error.js";

export type UseReconnectParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<ReconnectReturnType, Error, void, unknown>,
    "mutationFn"
  >;
};

export type UseReconnectReturnType = ReturnType<
  typeof useMutation<ReconnectReturnType, Error, void, unknown>
>;

export function useReconnect(
  parameters: UseReconnectParameters = {}
): UseReconnectReturnType {
  const contextConfig = useIvemConfig();
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
