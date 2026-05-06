# Ivem Kit Playgrounds

This directory contains runnable playgrounds for the Ivem Kit packages.

## Projects

- `vite-react` - React + Vite playground on port 3000
- `vite-vue` - Vue 3 + Vite playground on port 3001
- `vite-core` - Vanilla TypeScript + Vite playground on port 3002
- `next` - Next.js playground on port 3003

## Run

Run commands from the Ivem Kit repository root.

```bash
pnpm install
pnpm dev:playground:react
pnpm dev:playground:vue
pnpm dev:playground:core
pnpm dev:playground:next
```

## Build

```bash
pnpm build
pnpm build:playgrounds
```

## Requirements

- Install and enable the iWallet Pro browser extension.
- Create or import an IOST account in iWallet Pro.
- Unlock the wallet before running wallet actions.

## Package Coverage

- `vite-core` demonstrates the framework-agnostic `@ivem/kit` API.
- `vite-react` and `next` demonstrate `@ivem/kit-react`.
- `vite-vue` demonstrates `@ivem/kit-vue`.
- All playgrounds use `@ivem/core` for public client utilities where needed.
