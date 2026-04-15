# `@ivem/kit-react`

React hooks and provider utilities for IOST wallet flows.

## Install

```bash
pnpm add @ivem/kit-react @tanstack/react-query react react-dom
```

## Usage

```tsx
import { createConfig, iwallet, mainnet, IvemProvider, useAccount } from "@ivem/kit-react";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
});

export function App() {
  return (
    <IvemProvider config={config}>
      <Account />
    </IvemProvider>
  );
}

function Account() {
  const account = useAccount();
  return <div>{account.address ?? "Not connected"}</div>;
}
```

Requires `react`, `@tanstack/react-query`, and transitively installs `@ivem/kit`.
