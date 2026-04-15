import {
  createContext,
  createElement,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { reconnect, type Config, type State } from "@ivem/kit";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";

export const IvemContext = createContext<Config | undefined>(undefined);

export type IvemProviderProps = {
  config: Config;
  initialState?: State;
  reconnectOnMount?: boolean;
  queryClient?: QueryClient;
  queryClientConfig?: QueryClientConfig;
  children: ReactNode;
};

export function IvemProvider(props: IvemProviderProps) {
  const { children, config, initialState, reconnectOnMount = true } = props;
  const queryClient = useMemo(
    () => props.queryClient ?? new QueryClient(props.queryClientConfig),
    [props.queryClient, props.queryClientConfig]
  );

  // Tracks whether reconnect has already been attempted.
  const reconnectAttempted = useRef(false);

  useEffect(() => {
    // Apply the provided initial state when not in SSR mode.
    if (initialState && !config._internal.ssr) {
      config.setState(initialState);
    }

    // Skip reconnect during SSR.
    if (config._internal.ssr) return;

    // Reconnect once on mount when enabled.
    if (reconnectOnMount && !reconnectAttempted.current) {
      reconnectAttempted.current = true;
      reconnect(config).catch(() => {});
    }
  }, [config, initialState, reconnectOnMount]);

  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(IvemContext.Provider, { value: config }, children)
  );
}
