"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createPublicClient, http } from "@ivem/core";
import {
  createConfig,
  iwallet,
  mainnet,
  IvemProvider,
  useAccount,
  useCallContract,
  useWriteContract,
  useChainId,
  useConnect,
  useDisconnect,
  useReconnect,
  useSendTransaction,
  useSignMessage,
  useWaitForTransactionReceipt,
} from "@ivem/kit-react";

const config = createConfig({
  chains: [mainnet],
  connector: iwallet(),
  ssr: true,
});

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function Playground() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <IvemProvider config={config} reconnectOnMount queryClient={queryClient}>
      <DemoPage />
    </IvemProvider>
  );
}

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

function DemoPage() {
  const account = useAccount();
  const chainId = useChainId();
  const connect = useConnect();
  const reconnect = useReconnect();
  const disconnect = useDisconnect();
  const signMessage = useSignMessage();
  const sendTransaction = useSendTransaction();
  const {
    data: txReceipt,
    isLoading: isWaitingReceipt,
    error: waitReceiptError,
  } = useWaitForTransactionReceipt({
    hash: sendTransaction.data?.hash ?? "",
    enabled: Boolean(sendTransaction.data?.hash),
  });
  const writeContract = useWriteContract();
  const callContract = useCallContract();

  const [walletInstalled, setWalletInstalled] = useState(false);
  const [lastError, setLastError] = useState<string>("");
  const [eventLogs, setEventLogs] = useState<
    Array<{ id: number; time: string; event: string; payload: string }>
  >([]);

  const [message, setMessage] = useState("hello from next playground");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("sent by next playground");
  const [contract, setContract] = useState("token.iost");
  const [action, setAction] = useState("transfer");
  const [argsText, setArgsText] = useState(
    '["iost", "", "", "1", "write demo"]'
  );

  const [nodeInfo, setNodeInfo] = useState<unknown>(null);
  const [isLoadingNodeInfo, setIsLoadingNodeInfo] = useState(false);

  const appendEventLog = useCallback((event: string, payload: unknown) => {
    let payloadText = "";
    if (typeof payload === "string") payloadText = payload;
    else {
      try {
        payloadText = JSON.stringify(payload);
      } catch {
        payloadText = String(payload);
      }
    }

    setEventLogs((prev) =>
      [
        {
          id: Date.now() + Math.floor(Math.random() * 10000),
          time: new Date().toLocaleTimeString(),
          event,
          payload: payloadText,
        },
        ...prev,
      ].slice(0, 80)
    );
  }, []);

  useEffect(() => {
    const checkWallet = () => {
      setWalletInstalled(Boolean(window.IWalletJS?.isIWalletJS));
    };

    checkWallet();
    window.addEventListener("focus", checkWallet);
    return () => window.removeEventListener("focus", checkWallet);
  }, []);

  useEffect(() => {
    const provider = window.IWalletJS;
    if (!walletInstalled || !provider?.isIWalletJS) return;

    const events = [
      "accountChanged",
      "accountsChanged",
      "networkChanged",
      "pending",
      "success",
      "failed",
    ] as const;

    const unbinds = events.map((event) => {
      const handler = (payload: unknown) => appendEventLog(event, payload);
      provider.on?.(event, handler);
      return () => {
        provider.off?.(event, handler);
        provider.removeListener?.(event, handler);
      };
    });

    return () => {
      for (const unbind of unbinds) unbind();
    };
  }, [appendEventLog, walletInstalled]);

  useEffect(() => {
    if (account.address) {
      setArgsText(
        JSON.stringify(["iost", account.address, "bob", "1", "write demo"])
      );
    }
  }, [account.address]);

  const requestErrors = useMemo(() => {
    return [
      connect.error,
      disconnect.error,
      signMessage.error,
      sendTransaction.error,
      waitReceiptError,
      writeContract.error,
      callContract.error,
    ]
      .filter(Boolean)
      .map((x) => formatResult(x));
  }, [
    callContract.error,
    connect.error,
    disconnect.error,
    sendTransaction.error,
    waitReceiptError,
    signMessage.error,
    writeContract.error,
  ]);

  async function handleConnect() {
    setLastError("");
    try {
      await connect.mutateAsync();
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleReconnect() {
    setLastError("");
    try {
      await reconnect.mutateAsync();
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleDisconnect() {
    setLastError("");
    try {
      await disconnect.mutateAsync();
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleSign() {
    setLastError("");
    try {
      await signMessage.mutateAsync({ message });
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleSend() {
    setLastError("");
    if (!amount.trim()) {
      setLastError("Invalid amount. Please input a number > 0.");
      return;
    }

    if (!to.trim()) {
      setLastError("Receiver account is required.");
      return;
    }

    try {
      await sendTransaction.mutateAsync({
        to: to.trim(),
        amount: amount.trim(),
        memo,
      });
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  function parseArgs(): unknown[] | null {
    try {
      const parsed = JSON.parse(argsText);
      if (!Array.isArray(parsed)) {
        setLastError("Contract args must be a JSON array.");
        return null;
      }
      return parsed;
    } catch {
      setLastError("Invalid JSON in contract args.");
      return null;
    }
  }

  async function handleWriteContract() {
    setLastError("");
    const args = parseArgs();
    if (!args) return;

    try {
      await writeContract.mutateAsync({ contract, action, args, approves: [{ token: 'iost', amount: '1' }] });
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleCallContract() {
    setLastError("");
    const args = parseArgs();
    if (!args) return;

    try {
      await callContract.mutateAsync({ contract, action, args, approves: [{ token: 'iost', amount: '1' }] });
    } catch (error) {
      setLastError(formatResult(error));
    }
  }

  async function handleGetNodeInfo() {
    setLastError("");
    setIsLoadingNodeInfo(true);
    try {
      const result = await publicClient.getNodeInfo();
      setNodeInfo(result);
    } catch (error) {
      setLastError(formatResult(error));
    } finally {
      setIsLoadingNodeInfo(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 md:p-8">
      <header>
        <h1>Ivem Kit Next.js E2E Demo</h1>
        <p>For iost-iwallet-pro extension end-to-end flow testing (TanStack Query enabled).</p>
      </header>

      {!walletInstalled && (
        <section className="banner banner-warning">
          <strong>iWallet Pro not detected.</strong>
          <span>
            Please install/enable <code>iost-iwallet-pro</code>, then refresh
            this page.
          </span>
        </section>
      )}

      <section className="card">
        <h2>Wallet Status</h2>
        <div className="kv">
          <div>Installed</div>
          <div>{walletInstalled ? "Yes" : "No"}</div>
          <div>Connection</div>
          <div>{account.status}</div>
          <div>Chain</div>
          <div>{chainId}</div>
          <div>Account</div>
          <div>{account.address ?? "-"}</div>
        </div>
        <div className="row">
          <button
            onClick={handleReconnect}
            disabled={!walletInstalled || reconnect.isPending}
          >
            {reconnect.isPending ? "Reconnecting..." : "Reconnect"}
          </button>
          {!account.isConnected ? (
            <button
              onClick={handleConnect}
              disabled={!walletInstalled || connect.isPending}
            >
              {connect.isPending ? "Connecting..." : "Connect"}
            </button>
          ) : (
            <button onClick={handleDisconnect} disabled={disconnect.isPending}>
              {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Wallet Event Logs</h2>
        <div className="row">
          <button onClick={() => setEventLogs([])}>Clear Logs</button>
        </div>
        <div className="event-log">
          {eventLogs.length === 0 ? (
            <div className="muted">No wallet events yet.</div>
          ) : (
            eventLogs.map((log) => (
              <div key={log.id} className="event-item">
                <span className="event-time">{log.time}</span>
                <span className="event-name">{log.event}</span>
                <code>{log.payload || "-"}</code>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card">
        <h2>Sign Message</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="message"
        />
        <div className="row">
          <button
            onClick={handleSign}
            disabled={!account.isConnected || signMessage.isPending}
          >
            {signMessage.isPending ? "Signing..." : "Sign"}
          </button>
        </div>
        {signMessage.data != null && (
          <pre className="result">{formatResult(signMessage.data)}</pre>
        )}
      </section>

      <section className="card">
        <h2>Send Transaction</h2>
        <div className="form-grid">
          <label>
            To
            <input value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label>
            Amount
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="full">
            Memo
            <input value={memo} onChange={(e) => setMemo(e.target.value)} />
          </label>
        </div>
        <div className="row">
          <button
            onClick={handleSend}
            disabled={!account.isConnected || sendTransaction.isPending}
          >
            {sendTransaction.isPending ? "Sending..." : "Send"}
          </button>
        </div>
        {sendTransaction.data && (
          <pre className="result">{JSON.stringify(sendTransaction.data, null, 2)}</pre>
        )}
        {(sendTransaction.data || txReceipt || isWaitingReceipt) && (
          <div className="kv">
            <div>Last tx hash</div>
            <div>{sendTransaction.data?.hash ?? "-"}</div>
            <div>Receipt status</div>
            <div>{isWaitingReceipt ? "Waiting..." : txReceipt?.status_code ?? "-"}</div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Contract Tx</h2>
        <div className="form-grid">
          <label>
            Contract
            <input
              value={contract}
              onChange={(e) => setContract(e.target.value)}
            />
          </label>
          <label>
            Action
            <input value={action} onChange={(e) => setAction(e.target.value)} />
          </label>
          <label className="full">
            Args (JSON array)
            <textarea
              value={argsText}
              onChange={(e) => setArgsText(e.target.value)}
              rows={3}
            />
          </label>
        </div>
        <div className="row">
          <button
            onClick={handleWriteContract}
            disabled={!account.isConnected || writeContract.isPending}
          >
            {writeContract.isPending ? "Calling..." : "Write Contract"}
          </button>
          <button
            onClick={handleCallContract}
            disabled={!account.isConnected || callContract.isPending}
          >
            {callContract.isPending ? "Calling..." : "Call Contract"}
          </button>
        </div>
        {writeContract.data && (
          <pre className="result">{JSON.stringify(writeContract.data, null, 2)}</pre>
        )}
        {callContract.data && (
          <pre className="result">
            {JSON.stringify(callContract.data, null, 2)}
          </pre>
        )}
      </section>

      <section className="card">
        <h2>Public Client</h2>
        <div className="row">
          <button onClick={handleGetNodeInfo} disabled={isLoadingNodeInfo}>
            {isLoadingNodeInfo ? "Loading..." : "Get Node Info"}
          </button>
        </div>
        {nodeInfo != null && (
          <pre className="result">{JSON.stringify(nodeInfo, null, 2)}</pre>
        )}
      </section>

      {(lastError || requestErrors.length > 0) && (
        <section className="banner banner-error">
          <strong>Latest Error</strong>
          <pre className="result">
            {lastError || requestErrors[requestErrors.length - 1]}
          </pre>
        </section>
      )}
    </div>
  );
}
