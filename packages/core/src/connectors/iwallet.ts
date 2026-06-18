import type {
  Chain,
  Connector,
  ConnectorEventMap,
  IWalletProvider,
} from "../types/index.js";
import { createEmitter } from "../utils/emitter.js";

export type IWalletParameters = {
  getProvider?: () => IWalletProvider | undefined;
};

export function iwallet(
  parameters: IWalletParameters = {}
): (config: any) => Connector {
  let cleanupAccountsChanged: (() => void) | undefined;
  let cleanupNetworkChanged: (() => void) | undefined;

  function normalizeAccounts(value: unknown): readonly string[] {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) {
      return value.filter((x): x is string => typeof x === "string");
    }
    return [];
  }

  function networkToChainId(network: unknown): string {
    const normalized = String(network ?? "").toUpperCase();
    if (normalized.includes("MAINNET")) return "iost-mainnet";
    if (normalized.includes("TESTNET")) return "iost-testnet";
    return "iost-mainnet";
  }

  return (config) => {
    const emitter = createEmitter<ConnectorEventMap>();
    const configuredChains = (config?.chains ?? []) as readonly Chain[];

    return {
      id: "iwallet",
      name: "IWallet Pro",
      type: "injected",
      uid: emitter.uid,
      emitter,

      async setup() {
        const provider = await this.getProvider();
        if (!provider) return;

        const handleAccountsChanged = (accounts: unknown) => {
          const normalizedAccounts = normalizeAccounts(accounts);

          if (normalizedAccounts.length === 0) {
            emitter.emit("disconnect", undefined);
            return;
          }

          emitter.emit("change", { accounts: normalizedAccounts });
        };

        const handleNetworkChanged = async (chainLike: unknown) => {
          const chainId =
            String(chainLike ?? "").startsWith("iost-") === true
              ? String(chainLike)
              : networkToChainId(chainLike);
          const accounts = await this.getAccounts();
          emitter.emit("change", { accounts, chainId });
        };

        const bind = (event: string, handler: (...args: any[]) => void) => {
          provider.on(event, handler);
          return () => {
            provider.off(event, handler);
            provider.removeListener(event, handler);
          };
        };

        const unbindAccountsChanged = bind(
          "accountsChanged",
          handleAccountsChanged
        );
        cleanupAccountsChanged = () => {
          unbindAccountsChanged();
        };
        cleanupNetworkChanged = bind("networkChanged", handleNetworkChanged);
      },

      async connect() {
        const provider = await this.getProvider();
        if (!provider) throw new Error("IWalletJS not found");

        await provider.request({ method: "connect" });

        const accounts = await this.getAccounts();
        if (accounts.length === 0)
          throw new Error("No account returned from iWallet");

        const chainId = await this.getChainId();
        emitter.emit("connect", { accounts, chainId });
        return { accounts, chainId };
      },

      async disconnect() {
        const provider = await this.getProvider();
        if (!provider) return;

        try {
          await provider.request({ method: "disconnect" });
        } finally {
          cleanupAccountsChanged?.();
          cleanupAccountsChanged = undefined;
          cleanupNetworkChanged?.();
          cleanupNetworkChanged = undefined;

          emitter.emit("disconnect", undefined);
        }
      },

      async getAccounts() {
        const provider = await this.getProvider();
        if (!provider) return [];

        const response = await provider.request({ method: "accounts" });
        return normalizeAccounts(response);
      },

      async getChainId() {
        const provider = await this.getProvider();
        if (!provider) throw new Error("IWalletJS not found");

        try {
          const chainId = await provider.request<string>({ method: "chainId" });
          if (typeof chainId === "string" && chainId.length > 0) return chainId;
        } catch {
          // fallback to network request
        }

        const network = await provider.request({ method: "network" });
        const normalizedChainId = networkToChainId(network);
        const matched = configuredChains.find(
          (chain) => chain.id === normalizedChainId
        );
        if (matched) return matched.id;
        return normalizedChainId;
      },

      async getProvider() {
        if (parameters.getProvider) {
          const provider = parameters.getProvider();
          if (provider?.isIWalletJS) return provider;
          return undefined;
        }

        if (typeof window === "undefined") return undefined;

        const provider = window.IWalletJS;
        if (!provider?.isIWalletJS) return undefined;
        return provider;
      },

      async isAuthorized() {
        const provider = await this.getProvider();
        if (!provider) return false;

        const accounts = await this.getAccounts();
        return accounts.length > 0;
      },

      onAccountsChanged(accounts) {
        const normalizedAccounts = normalizeAccounts(accounts);
        if (normalizedAccounts.length === 0) {
          emitter.emit("disconnect", undefined);
          return;
        }

        emitter.emit("change", { accounts: normalizedAccounts });
      },

      onChainChanged(chainLike) {
        const chainId =
          String(chainLike ?? "").startsWith("iost-") === true
            ? String(chainLike)
            : networkToChainId(chainLike);
        emitter.emit("change", { chainId });
      },

      onDisconnect() {
        cleanupAccountsChanged?.();
        cleanupAccountsChanged = undefined;
        cleanupNetworkChanged?.();
        cleanupNetworkChanged = undefined;

        emitter.emit("disconnect", undefined);
      },
    };
  };
}
