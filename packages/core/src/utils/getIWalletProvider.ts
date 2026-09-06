import type { IWalletProvider } from "../types/index.js";

export const IWALLET_INITIALIZED_EVENT = "IWalletJS#initialized";
export const IWALLET_PROVIDER_TIMEOUT = 3_000;

export type GetIWalletProviderFn = () => IWalletProvider | undefined;

export type WaitForIWalletProviderParameters = {
  timeout?: number;
  interval?: number;
  getProvider?: GetIWalletProviderFn;
};

export type WatchIWalletProviderParameters = WaitForIWalletProviderParameters;

function isUsableProvider(
  provider: IWalletProvider | undefined
): provider is IWalletProvider {
  return Boolean(provider?.isIWalletJS) && typeof provider?.request === "function";
}

function readProvider(
  getProvider?: GetIWalletProviderFn
): IWalletProvider | undefined {
  if (getProvider) {
    const provider = getProvider();
    return isUsableProvider(provider) ? provider : undefined;
  }

  if (typeof window === "undefined") return undefined;
  return isUsableProvider(window.IWalletJS) ? window.IWalletJS : undefined;
}

export function getIWalletProvider(
  getProvider?: GetIWalletProviderFn
): IWalletProvider | undefined {
  return readProvider(getProvider);
}

export function waitForIWalletProvider(
  parameters: WaitForIWalletProviderParameters = {}
): Promise<IWalletProvider | undefined> {
  const {
    timeout = IWALLET_PROVIDER_TIMEOUT,
    interval = 100,
    getProvider,
  } = parameters;

  const existing = readProvider(getProvider);
  if (existing) return Promise.resolve(existing);
  if (typeof window === "undefined" || timeout <= 0) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (provider?: IWalletProvider) => {
      if (settled) return;
      settled = true;
      window.removeEventListener(IWALLET_INITIALIZED_EVENT, onInitialized);
      window.clearInterval(pollId);
      window.clearTimeout(timer);
      resolve(provider);
    };

    const check = () => {
      const provider = readProvider(getProvider);
      if (provider) finish(provider);
    };

    const onInitialized = () => check();
    window.addEventListener(IWALLET_INITIALIZED_EVENT, onInitialized);

    const pollId = window.setInterval(check, interval);
    const timer = window.setTimeout(() => {
      finish(readProvider(getProvider));
    }, timeout);
  });
}

export function watchIWalletProvider(
  onChange: (provider: IWalletProvider | undefined) => void,
  parameters: WatchIWalletProviderParameters = {}
): () => void {
  const {
    timeout = IWALLET_PROVIDER_TIMEOUT,
    interval = 100,
    getProvider,
  } = parameters;

  if (typeof window === "undefined") {
    onChange(undefined);
    return () => {};
  }

  let found = false;
  let lastKey: string | undefined;
  let pollId: number | undefined;
  let timer: number | undefined;

  const stopPolling = () => {
    if (pollId != null) {
      window.clearInterval(pollId);
      pollId = undefined;
    }
    if (timer != null) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };

  const notify = () => {
    const provider = readProvider(getProvider);
    const nextKey = provider ? "1" : "0";
    if (provider) found = true;
    if (lastKey !== nextKey) {
      lastKey = nextKey;
      onChange(provider);
    }
    if (found) stopPolling();
  };

  const onInitialized = () => notify();
  const onFocus = () => notify();

  window.addEventListener(IWALLET_INITIALIZED_EVENT, onInitialized);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);

  notify();

  if (!found && timeout > 0) {
    pollId = window.setInterval(notify, interval);
    timer = window.setTimeout(() => {
      notify();
      stopPolling();
    }, timeout);
  }

  return () => {
    window.removeEventListener(IWALLET_INITIALIZED_EVENT, onInitialized);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onFocus);
    stopPolling();
  };
}
