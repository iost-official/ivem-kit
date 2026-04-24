import type { Sidebar } from "vocs";

const reactSidebar = [
  {
    text: "Introduction",
    items: [
      { text: "Why Ivem Kit", link: "/react/why" },
      { text: "Installation", link: "/react/installation" },
      { text: "Getting Started", link: "/react/getting-started" },
      { text: "Overview", link: "/react/overview" },
    ],
  },
  {
    text: "Hooks",
    items: [
      { text: "Hooks Overview", link: "/react/hooks" },
      { text: "useConfig", link: "/react/hooks/useConfig" },
      { text: "useAccount", link: "/react/hooks/useAccount" },
      { text: "useConnect", link: "/react/hooks/useConnect" },
      { text: "useReconnect", link: "/react/hooks/useReconnect" },
      { text: "useDisconnect", link: "/react/hooks/useDisconnect" },
      { text: "useChainId", link: "/react/hooks/useChainId" },
      { text: "useSignMessage", link: "/react/hooks/useSignMessage" },
      { text: "useSendTransaction", link: "/react/hooks/useSendTransaction" },
      { text: "useWriteContract", link: "/react/hooks/useWriteContract" },
      { text: "useCallContract", link: "/react/hooks/useCallContract" },
      {
        text: "useWaitForTransactionReceipt",
        link: "/react/hooks/useWaitForTransactionReceipt",
      },
    ],
  },
];

const vueSidebar = [
  {
    text: "Introduction",
    items: [
      { text: "Why Ivem Kit", link: "/vue/why" },
      { text: "Installation", link: "/vue/installation" },
      { text: "Getting Started", link: "/vue/getting-started" },
      { text: "Overview", link: "/vue/overview" },
    ],
  },
  {
    text: "Composables",
    items: [
      { text: "Composables Overview", link: "/vue/composables" },
      { text: "useIvemConfig", link: "/vue/composables/useIvemConfig" },
      { text: "useAccount", link: "/vue/composables/useAccount" },
      { text: "useConnect", link: "/vue/composables/useConnect" },
      { text: "useReconnect", link: "/vue/composables/useReconnect" },
      { text: "useDisconnect", link: "/vue/composables/useDisconnect" },
      { text: "useChainId", link: "/vue/composables/useChainId" },
      { text: "useSignMessage", link: "/vue/composables/useSignMessage" },
      { text: "useSendTransaction", link: "/vue/composables/useSendTransaction" },
      { text: "useWriteContract", link: "/vue/composables/useWriteContract" },
      { text: "useCallContract", link: "/vue/composables/useCallContract" },
      {
        text: "useWaitForTransactionReceipt",
        link: "/vue/composables/useWaitForTransactionReceipt",
      },
    ],
  },
];

const coreSidebar = [
  {
    text: "Introduction",
    items: [
      { text: "Why Ivem Kit", link: "/core/why" },
      { text: "Installation", link: "/core/installation" },
      { text: "Getting Started", link: "/core/getting-started" },
    ],
  },
  {
    text: "Configuration",
    items: [{ text: "createConfig", link: "/core/create-config" }],
  },
  {
    text: "Actions",
    items: [
      { text: "Actions Overview", link: "/core/actions" },
      { text: "connect", link: "/core/actions/connect" },
      { text: "reconnect", link: "/core/actions/reconnect" },
      { text: "disconnect", link: "/core/actions/disconnect" },
      { text: "getAccount", link: "/core/actions/getAccount" },
      { text: "getChainId", link: "/core/actions/getChainId" },
      { text: "signMessage", link: "/core/actions/signMessage" },
      { text: "sendTransaction", link: "/core/actions/sendTransaction" },
      { text: "writeContract", link: "/core/actions/writeContract" },
      { text: "callContract", link: "/core/actions/callContract" },
      {
        text: "waitForTransactionReceipt",
        link: "/core/actions/waitForTransactionReceipt",
      },
    ],
  },
  {
    text: "Connectors",
    items: [{ text: "iWallet Connector", link: "/core/connectors/iwallet" }],
  },
];

export const sidebar: Sidebar = {
  "/react": reactSidebar,
  "/vue": vueSidebar,
  "/core": coreSidebar,
};
