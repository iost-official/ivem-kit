import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  disconnect,
  type Config,
  type DisconnectReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
import { normalizeHookError } from "./error.js";

export type UseDisconnectParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<DisconnectReturnType, Error, void, unknown>,
    "mutationFn"
  >;
};

export type UseDisconnectReturnType = ReturnType<
  typeof useMutation<DisconnectReturnType, Error, void, unknown>
>;

export function useDisconnect(
  parameters: UseDisconnectParameters = {}
): UseDisconnectReturnType {
  const contextConfig = useIvemConfig();
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
