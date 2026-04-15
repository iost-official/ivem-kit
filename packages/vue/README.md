# `@ivem/kit-vue`

Vue plugin and composables for IOST wallet flows.

## Install

```bash
pnpm add @ivem/kit-vue @tanstack/vue-query vue
```

## Usage

```ts
import { createApp } from "vue";
import { createConfig, iwallet, mainnet, IvemPlugin } from "@ivem/kit-vue";
import App from "./App.vue";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
});

createApp(App).use(IvemPlugin({ config })).mount("#app");
```

Requires `vue`, `@tanstack/vue-query`, and transitively installs `@ivem/kit`.
