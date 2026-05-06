declare global {
  interface Window {
    IWalletJS?: {
      isIWalletJS?: boolean;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      off?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void
      ) => void;
    };
  }
}

export {};
