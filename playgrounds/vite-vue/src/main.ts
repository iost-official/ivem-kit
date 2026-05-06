import { createApp } from "vue";
import { QueryClient } from "@tanstack/vue-query";
import { createConfig, iwallet, mainnet, IvemPlugin } from "@ivem/kit-vue";
import App from "./App.vue";
import "./style.css";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
});
const queryClient = new QueryClient();

const app = createApp(App);
app.use(IvemPlugin({ config, queryClient }));
app.mount("#app");
