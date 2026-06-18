<template>
  <div class="demo-shell">
    <header>
      <h1>Ivem Kit Vue E2E Demo</h1>
      <p>For iost-iwallet-pro extension end-to-end flow testing (TanStack Query enabled).</p>
    </header>

    <section v-if="!walletInstalled" class="banner banner-warning">
      <strong>iWallet Pro not detected.</strong>
      <span>
        Please install/enable <code>iost-iwallet-pro</code>, then refresh this page.
      </span>
    </section>

    <section class="card">
      <h2>Wallet Status</h2>
      <div class="kv">
        <div>Installed</div>
        <div>{{ walletInstalled ? "Yes" : "No" }}</div>
        <div>Connection</div>
        <div>{{ account.status }}</div>
        <div>Chain</div>
        <div>{{ chainId }}</div>
        <div>Account</div>
        <div>{{ account.address || "-" }}</div>
      </div>
      <div class="row">
        <button @click="handleReconnect" :disabled="!walletInstalled || reconnectPending">
          {{ reconnectPending ? "Reconnecting..." : "Reconnect" }}
        </button>
        <button
          v-if="!account.isConnected"
          @click="handleConnect"
          :disabled="!walletInstalled || connectPending"
        >
          {{ connectPending ? "Connecting..." : "Connect" }}
        </button>
        <button v-else @click="handleDisconnect" :disabled="disconnectPending">
          {{ disconnectPending ? "Disconnecting..." : "Disconnect" }}
        </button>
      </div>
    </section>

    <section class="card">
      <h2>Wallet Event Logs</h2>
      <div class="row">
        <button @click="eventLogs = []">Clear Logs</button>
      </div>
      <div class="event-log">
        <div v-if="eventLogs.length === 0" class="muted">No wallet events yet.</div>
        <div v-for="log in eventLogs" :key="log.id" class="event-item">
          <span class="event-time">{{ log.time }}</span>
          <span class="event-name">{{ log.event }}</span>
          <code>{{ log.payload || "-" }}</code>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Sign Message</h2>
      <textarea v-model="message" rows="3" />
      <div class="row">
        <button @click="handleSign" :disabled="!account.isConnected || signPending">
          {{ signPending ? "Signing..." : "Sign" }}
        </button>
      </div>
      <pre v-if="signMessageData != null" class="result">{{ formattedSignData }}</pre>
    </section>

    <section class="card">
      <h2>Send Transaction</h2>
      <div class="form-grid">
        <label>
          To
          <input v-model="to" />
        </label>
        <label>
          Amount
          <input v-model="amount" inputmode="decimal" />
        </label>
        <label class="full">
          Memo
          <input v-model="memo" />
        </label>
      </div>
      <div class="row">
        <button @click="handleSend" :disabled="!account.isConnected || sendPending">
          {{ sendPending ? "Sending..." : "Send" }}
        </button>
      </div>
      <pre v-if="sendTransactionData != null" class="result">{{ formatResult(sendTransactionData) }}</pre>
    </section>

    <section class="card">
      <h2>Contract Tx</h2>
      <div class="form-grid">
        <label>
          Contract
          <input v-model="contract" />
        </label>
        <label>
          Action
          <input v-model="action" />
        </label>
        <label class="full">
          Args (JSON array)
          <textarea v-model="argsText" rows="3" />
        </label>
      </div>
      <div class="row">
        <button @click="handleWriteContract" :disabled="!account.isConnected || writePending">
          {{ writePending ? "Calling..." : "Write Contract" }}
        </button>
        <button @click="handleCallContract" :disabled="!account.isConnected || callContractPending">
          {{ callContractPending ? "Calling..." : "Call Contract" }}
        </button>
      </div>
      <pre v-if="writeContractData != null" class="result">{{ formatResult(writeContractData) }}</pre>
      <pre v-if="callContractData != null" class="result">{{ formatResult(callContractData) }}</pre>
    </section>

    <section class="card">
      <h2>Public Client</h2>
      <div class="row">
        <button @click="handleGetNodeInfo" :disabled="nodeInfoLoading">
          {{ nodeInfoLoading ? "Loading..." : "Get Node Info" }}
        </button>
      </div>
      <pre v-if="nodeInfo" class="result">{{ JSON.stringify(nodeInfo, null, 2) }}</pre>
    </section>

    <section v-if="latestError" class="banner banner-error">
      <strong>Latest Error</strong>
      <pre class="result">{{ latestError }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { createPublicClient, http } from "@ivem/core";
import {
  mainnet,
  useAccount,
  useCallContract,
  useWriteContract,
  useChainId,
  useConnect,
  useDisconnect,
  useReconnect,
  useSendTransaction,
  useSignMessage,
} from "@ivem/kit-vue";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const account = useAccount();
const chainId = useChainId();
const connect = useConnect();
const reconnect = useReconnect();
const disconnect = useDisconnect();
const signMessage = useSignMessage();
const sendTransaction = useSendTransaction();
const writeContract = useWriteContract();
const callContract = useCallContract();

const walletInstalled = ref(false);
const latestError = ref("");
const eventLogs = ref<Array<{ id: number; time: string; event: string; payload: string }>>(
  []
);
let unbindWalletEvents: Array<() => void> = [];

const message = ref("Hello from Ivem Kit vite-vue");
const to = ref("");
const amount = ref("1");
const memo = ref("sent by Ivem Kit vite-vue");
const contract = ref("token.iost");
const action = ref("transfer");
const argsText = ref('["iost", "", "", "1", "write demo"]');

const nodeInfo = ref<unknown>(null);
const nodeInfoLoading = ref(false);

function formatResult(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value instanceof Error) {
    const code =
      typeof (value as Error & { code?: unknown }).code === "number"
        ? (value as Error & { code: number }).code
        : undefined;
    const baseMessage = code != null ? `[${code}] ${value.message}` : value.message;
    return value.stack ? `${baseMessage}\n${value.stack}` : baseMessage;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const requestErrors = computed(() => {
  return [
    connect.error.value,
    reconnect.error.value,
    disconnect.error.value,
    signMessage.error.value,
    sendTransaction.error.value,
    writeContract.error.value,
    callContract.error.value,
  ]
    .filter(Boolean)
    .map((x) => formatResult(x));
});

const connectPending = computed(() => connect.isPending.value);
const reconnectPending = computed(() => reconnect.isPending.value);
const disconnectPending = computed(() => disconnect.isPending.value);
const signPending = computed(() => signMessage.isPending.value);
const sendPending = computed(() => sendTransaction.isPending.value);
const writePending = computed(() => writeContract.isPending.value);
const callContractPending = computed(() => callContract.isPending.value);

const signMessageData = computed(() => signMessage.data.value);
const sendTransactionData = computed(() => sendTransaction.data.value);
const writeContractData = computed(() => writeContract.data.value);
const callContractData = computed(() => callContract.data.value);

const formattedSignData = computed(() => {
  if (signMessageData.value == null) return "";
  return formatResult(signMessageData.value);
});

watch(requestErrors, (errors) => {
  if (errors.length > 0) {
    latestError.value = errors[errors.length - 1];
  }
});

watch(
  () => account.value.address,
  (address) => {
    if (address) {
      argsText.value = JSON.stringify([
        "iost",
        address,
        address,
        "1",
        "write demo",
      ]);
    }
  },
  { immediate: true }
);

function checkWallet() {
  walletInstalled.value = Boolean(window.IWalletJS?.isIWalletJS);

  for (const unbind of unbindWalletEvents) unbind();
  unbindWalletEvents = [];

  const provider = window.IWalletJS;
  if (!provider?.isIWalletJS) return;

  const events = [
    "accountsChanged",
    "networkChanged",
    "pending",
    "success",
    "failed",
  ] as const;

  for (const event of events) {
    const handler = (payload: unknown) => {
      eventLogs.value = [
        {
          id: Date.now() + Math.floor(Math.random() * 10000),
          time: new Date().toLocaleTimeString(),
          event,
          payload: formatResult(payload),
        },
        ...eventLogs.value,
      ].slice(0, 80);
    };

    provider.on?.(event, handler);
    unbindWalletEvents.push(() => {
      provider.off?.(event, handler);
      provider.removeListener?.(event, handler);
    });
  }
}

onMounted(() => {
  checkWallet();
  window.addEventListener("focus", checkWallet);
});

onUnmounted(() => {
  window.removeEventListener("focus", checkWallet);
  for (const unbind of unbindWalletEvents) unbind();
  unbindWalletEvents = [];
});

async function handleConnect() {
  latestError.value = "";
  try {
    await connect.mutateAsync();
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleReconnect() {
  latestError.value = "";
  try {
    await reconnect.mutateAsync();
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleDisconnect() {
  latestError.value = "";
  try {
    await disconnect.mutateAsync();
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleSign() {
  latestError.value = "";
  try {
    await signMessage.mutateAsync({ message: message.value });
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleSend() {
  latestError.value = "";
  const parsedAmount = Number(amount.value);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    latestError.value = "Invalid amount. Please input a number > 0.";
    return;
  }

  if (!to.value.trim()) {
    latestError.value = "Receiver account is required.";
    return;
  }

  try {
    await sendTransaction.mutateAsync({
      to: to.value.trim(),
      amount: amount.value.trim(),
      memo: memo.value,
    });
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

function parseArgs(): unknown[] | null {
  try {
    const parsed = JSON.parse(argsText.value);
    if (!Array.isArray(parsed)) {
      latestError.value = "Contract args must be a JSON array.";
      return null;
    }
    return parsed;
  } catch {
    latestError.value = "Invalid JSON in contract args.";
    return null;
  }
}

async function handleWriteContract() {
  latestError.value = "";
  const args = parseArgs();
  if (!args) return;

  try {
    await writeContract.mutateAsync({
      contract: contract.value,
      action: action.value,
      args,
      approves:[
        {
          token:"iost",
          amount: "1",
        }
      ]
    });
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleCallContract() {
  latestError.value = "";
  const args = parseArgs();
  if (!args) return;

  try {
    await callContract.mutateAsync({
      contract: contract.value,
      action: action.value,
      args,
      approves:[
        {
          token:"iost",
          amount: "1",
        }
      ]
    });
  } catch (error) {
    latestError.value = formatResult(error);
  }
}

async function handleGetNodeInfo() {
  latestError.value = "";
  nodeInfoLoading.value = true;
  try {
    nodeInfo.value = await publicClient.getNodeInfo();
  } catch (error) {
    latestError.value = formatResult(error);
  } finally {
    nodeInfoLoading.value = false;
  }
}
</script>
