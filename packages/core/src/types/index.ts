// Core type definitions.
export type IWalletProvider = {
  isIWalletJS: boolean;
  request: <T = unknown>(params: { method: string; params?: any }) => Promise<T>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  account?: {
    account: string;
    name: string;
    network: string;
  };
  network?: string;
};

declare global {
  interface Window {
    IWalletJS?: IWalletProvider;
  }
}

export type Chain = {
  id: string;
  name: string;
  network: "mainnet" | "testnet";
  rpcUrls: string[];
};

export type Account = {
  address: string;
  name?: string;
};

export type ConnectorEventMap = {
  connect: { accounts: readonly string[]; chainId: string };
  disconnect: void;
  change: { accounts?: readonly string[]; chainId?: string };
  message: { type: string; data?: unknown };
  error: Error;
};

export type Connector = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly uid: string;
  readonly emitter: any;

  setup?(): Promise<void>;
  connect(): Promise<{
    accounts: readonly string[];
    chainId: string;
  }>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<readonly string[]>;
  getChainId(): Promise<string>;
  getProvider(): Promise<IWalletProvider | undefined>;
  isAuthorized(): Promise<boolean>;
  onAccountsChanged?(accounts: string[]): void;
  onChainChanged?(chainId: string): void;
  onDisconnect?(error?: Error): void;
};

export type CreateConnectorFn = (config: any) => Connector;

export type Storage = {
  getItem<T = any>(
    key: string,
    defaultValue?: T | null
  ): T | null | Promise<T | null>;
  setItem<T = any>(key: string, value: T): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

export type State = {
  accounts: readonly string[];
  chainId: string;
  status: "connected" | "connecting" | "disconnected" | "reconnecting";
  current: string | null;
};
