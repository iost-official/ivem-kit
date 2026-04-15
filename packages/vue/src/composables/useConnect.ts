import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import {
  connect,
  type Config,
  type ConnectParameters,
  type ConnectReturnType,
} from "@ivem/kit";
import { useIvemConfig } from "../plugin.js";
import { normalizeHookError } from "./error.js";

export type UseConnectParameters = {
  config?: Config;
  mutation?: Omit<
    UseMutationOptions<
      ConnectReturnType,
      Error,
      ConnectParameters | void,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseConnectReturnType = ReturnType<
  typeof useMutation<ConnectReturnType, Error, ConnectParameters | void, unknown>
>;

export function useConnect(
  parameters: UseConnectParameters = {}
): UseConnectReturnType {
  const contextConfig = useIvemConfig();
  const config = parameters.config ?? contextConfig;

  return useMutation({
    ...parameters.mutation,
    mutationFn: async (params) => {
      try {
        return await connect(config, params ?? {});
      } catch (err) {
        throw normalizeHookError(err);
      }
    },
  });
}
