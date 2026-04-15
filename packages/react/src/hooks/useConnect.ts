import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import {
  connect,
  type Config,
  type ConnectParameters,
  type ConnectReturnType,
} from "@ivem/kit";
import { useConfig } from "./useConfig.js";
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

export type UseConnectReturnType = UseMutationResult<
  ConnectReturnType,
  Error,
  ConnectParameters | void,
  unknown
>;

export function useConnect(
  parameters: UseConnectParameters = {}
): UseConnectReturnType {
  const contextConfig = useConfig();
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
