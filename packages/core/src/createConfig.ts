import { createStore } from "zustand/vanilla";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type {
  Chain,
  Connector,
  State,
  Storage,
  CreateConnectorFn,
} from "./types/index.js";
import { createStorage, getDefaultStorage } from "./utils/storage.js";

export type CreateConfigParameters = {
  chains: readonly Chain[];
  connector: CreateConnectorFn;
  storage?: Storage | null;
  ssr?: boolean;
};

export type Config = {
  readonly chains: readonly Chain[];
  readonly connector: Connector;
  readonly storage: Storage | null;

  readonly state: State;
  setState(value: State | ((state: State) => State)): void;
  subscribe<TState>(
    selector: (state: State) => TState,
    listener: (state: TState, previousState: TState) => void,
    options?: {
      emitImmediately?: boolean;
      equalityFn?: (a: TState, b: TState) => boolean;
    }
  ): () => void;

  _internal: {
    readonly store: any;
    readonly ssr: boolean;
  };
};

export function createConfig(parameters: CreateConfigParameters): Config {
  const {
    storage = createStorage({ storage: getDefaultStorage() }),
    ssr = false,
  } = parameters;

  const chains = parameters.chains;
  const connectorInstance = parameters.connector({
    chains,
    storage,
  });

  // Initialize the default state.
  function getInitialState(): State {
    return {
      accounts: [],
      chainId: chains[0].id,
      status: "disconnected",
      current: null,
    };
  }

  // Create the state store.
  const store = createStore(
    subscribeWithSelector(
      storage
        ? persist(getInitialState, {
            name: "ivem-store",
            storage: storage as any,
            skipHydration: ssr,
            version: 1,
            partialize: (state) => ({
              accounts: state.accounts,
              chainId: state.chainId,
              current: state.current,
            }),
            merge: (persistedState, currentState) => {
              if (
                typeof persistedState === "object" &&
                persistedState &&
                "status" in persistedState
              ) {
                delete (persistedState as any).status;
              }
              return {
                ...currentState,
                ...(persistedState as object),
              };
            },
          })
        : getInitialState
    )
  );

  // Subscribe to connector events.
  connectorInstance.emitter.on(
    "connect",
    (data: { accounts: readonly string[]; chainId: string }) => {
      store.setState({
        accounts: data.accounts as readonly string[],
        chainId: data.chainId,
        status: "connected",
        current: connectorInstance.uid,
      });
    }
  );

  connectorInstance.emitter.on("disconnect", () => {
    store.setState({
      accounts: [],
      status: "disconnected",
      current: null,
    });
  });

  connectorInstance.emitter.on(
    "change",
    (data: { accounts?: readonly string[]; chainId?: string }) => {
      store.setState((state) => ({
        ...state,
        accounts: data.accounts ?? state.accounts,
        chainId: data.chainId ?? state.chainId,
      }));
    }
  );

  // Initialize the connector.
  connectorInstance.setup?.();

  return {
    get chains() {
      return chains;
    },
    get connector() {
      return connectorInstance;
    },
    storage,

    get state() {
      return store.getState();
    },
    setState(value) {
      const newState =
        typeof value === "function" ? value(store.getState()) : value;
      store.setState(newState, true);
    },
    subscribe(selector, listener, options) {
      return store.subscribe(selector as any, listener, options as any);
    },

    _internal: {
      store,
      ssr: Boolean(ssr),
    },
  };
}
