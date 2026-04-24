import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vocs";
import { sidebar } from "./sidebar";

export default defineConfig({
  title: "Ivem Kit",
  titleTemplate: "%s · Ivem Kit",
  description:
    "IOST toolkit with a shared core package, React hooks, Vue composables, and an iWallet connector.",
  rootDir: ".",
  sidebar,
  topNav: [
    { text: "React", link: "/react/getting-started", match: "/react" },
    {
      text: "Core",
      link: "/core/getting-started",
      match: (path: string) => path.startsWith("/core") || path.startsWith("/guides"),
    },
    { text: "Vue", link: "/vue/getting-started", match: "/vue" },
    { text: "GitHub", link: "https://github.com/iost-official/ivem-kit" },
  ],
  socials: [{ icon: "github", link: "https://github.com/iost-official/ivem-kit" }],
  editLink: {
    pattern: "https://github.com/iost-official/ivem-kit/edit/main/site/pages/:path",
    text: "Suggest changes to this page",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
