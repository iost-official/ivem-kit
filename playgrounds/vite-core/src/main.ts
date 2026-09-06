import {
  connect,
  createConfig,
  disconnect,
  getAccount,
  getChainId,
  iwallet,
  mainnet,
  sendTransaction,
  signMessage,
  watchIWalletProvider,
  writeContract,
} from "@ivem/kit";
import "./style.css";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
});

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app not found");

app.innerHTML = `
  <main class="shell">
    <section class="card">
      <h1>vite-core playground</h1>
      <p>Core-only usage without React/Vue wrappers.</p>
      <div class="grid">
        <div>Wallet Installed</div><div id="installed">-</div>
        <div>Status</div><div id="status">disconnected</div>
        <div>Chain ID</div><div id="chain">${getChainId(config)}</div>
        <div>Address</div><div id="address">-</div>
      </div>
      <div class="row">
        <button id="connect">Connect</button>
        <button id="disconnect">Disconnect</button>
      </div>
    </section>

    <section class="card">
      <h2>Sign Message</h2>
      <textarea id="message" rows="3">hello from vite-core</textarea>
      <div class="row"><button id="sign">Sign</button></div>
      <pre id="signature" class="result"></pre>
    </section>

    <section class="card">
      <h2>Send Transaction</h2>
      <div class="form-grid">
        <label>To<input id="to" /></label>
        <label>Amount<input id="amount" value="1" /></label>
      </div>
      <div class="row"><button id="send">Send</button></div>
      <pre id="sendResult" class="result"></pre>
    </section>

    <section class="card">
      <h2>Write Contract</h2>
      <div class="form-grid">
        <label>Contract<input id="contract" value="token.iost" /></label>
        <label>Action<input id="action" value="transfer" /></label>
        <label class="full">Args(JSON)<textarea id="args" rows="3">["iost","alice","bob","1.00000000","demo"]</textarea></label>
      </div>
      <div class="row"><button id="call">Call</button></div>
      <pre id="callResult" class="result"></pre>
    </section>

    <section class="banner banner-error" id="error-section" style="display: none;">
      <strong>Latest Error</strong>
      <pre id="error" class="result"></pre>
    </section>
  </main>
`;

const $ = <T extends HTMLElement>(id: string) => {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
};

const updateStatus = () => {
  const account = getAccount(config);
  $("installed").textContent = window.IWalletJS?.isIWalletJS ? "Yes" : "No";
  $("status").textContent = account.status;
  $("chain").textContent = account.chainId;
  $("address").textContent = account.address ?? "-";
};

const setError = (error: unknown) => {
  if (!error) {
    $("error").textContent = "";
    $("error-section").style.display = "none";
    return;
  }
  
  $("error-section").style.display = "grid";

  if (error instanceof Error) {
    const code =
      typeof (error as Error & { code?: unknown }).code === "number"
        ? (error as Error & { code: number }).code
        : undefined;
    $("error").textContent = code != null ? `[${code}] ${error.message}` : error.message;
    return;
  }

  $("error").textContent = String((error as { message?: unknown }).message ?? error);
};

const setResult = (id: string, value: unknown) => {
  $(id).textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

config.subscribe((state) => state, updateStatus);
updateStatus();
watchIWalletProvider(() => {
  updateStatus();
});

$("connect").addEventListener("click", async () => {
  setError("");
  try {
    await connect(config);
    updateStatus();
  } catch (error) {
    setError(error);
  }
});

$("disconnect").addEventListener("click", async () => {
  setError("");
  try {
    await disconnect(config);
    updateStatus();
  } catch (error) {
    setError(error);
  }
});

$("sign").addEventListener("click", async () => {
  setError("");
  try {
    const signature = await signMessage(config, {
      message: (document.getElementById("message") as HTMLTextAreaElement).value,
    });
    setResult("signature", signature);
  } catch (error) {
    setError(error);
  }
});

$("send").addEventListener("click", async () => {
  setError("");
  try {
    const result = await sendTransaction(config, {
      to: (document.getElementById("to") as HTMLInputElement).value,
      amount: (document.getElementById("amount") as HTMLInputElement).value,
    });
    setResult("sendResult", result);
  } catch (error) {
    setError(error);
  }
});

$("call").addEventListener("click", async () => {
  setError("");
  try {
    const args = JSON.parse((document.getElementById("args") as HTMLTextAreaElement).value);
    const result = await writeContract(config, {
      contract: (document.getElementById("contract") as HTMLInputElement).value,
      action: (document.getElementById("action") as HTMLInputElement).value,
      args,
      approves: [{
        token: 'iost',
        amount: '1'
      }],
    });
    setResult("callResult", result);
  } catch (error) {
    setError(error);
  }
});
