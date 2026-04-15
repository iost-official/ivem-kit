# `@ivem/kit`

Headless IOST wallet integration primitives built on top of `@ivem/core`.

## Install

```bash
pnpm add @ivem/kit @ivem/core
```

## Usage

```ts
import { createConfig, iwallet, mainnet, connect } from "@ivem/kit";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
});

await connect(config);
```

Requires `@ivem/core` as a peer dependency.
