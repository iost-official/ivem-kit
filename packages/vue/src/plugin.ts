import { inject, type App, type InjectionKey } from "vue";
import { reconnect, type Config, type State } from "@ivem/kit";
import {
  QueryClient,
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from "@tanstack/vue-query";

export const IvemConfigKey: InjectionKey<Config> = Symbol("ivem-config");

export type IvemPluginOptions = {
  config: Config;
  initialState?: State;
  reconnectOnMount?: boolean;
  queryClient?: QueryClient;
  queryClientOptions?: Omit<VueQueryPluginOptions, "queryClient">;
};

export function IvemPlugin(options: IvemPluginOptions) {
  return {
    install(app: App) {
      const { config, initialState, reconnectOnMount = true } = options;
      const queryClient = options.queryClient ?? new QueryClient();

      // Apply the provided initial state when not in SSR mode.
      if (initialState && !config._internal.ssr) {
        config.setState(initialState);
      }

      app.use(VueQueryPlugin, {
        queryClient,
        ...(options.queryClientOptions ?? {}),
      });

      // Provide the config to the component tree.
      app.provide(IvemConfigKey, config);

      // Skip reconnect during SSR.
      if (!config._internal.ssr && reconnectOnMount) {
        reconnect(config).catch(() => { });
      }
    },
  };
}

export function useIvemConfig(): Config {
  const config = inject(IvemConfigKey);

  if (!config) {
    throw new Error("useIvemConfig must be used after installing IvemPlugin");
  }

  return config;
}
