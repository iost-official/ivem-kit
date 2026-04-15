import { createWalletClient, custom } from "@ivem/core";
import type { Config } from "../createConfig.js";
import type { IWalletProvider } from "../types/index.js";

type IvemWalletClient = ReturnType<typeof createWalletClient>;

function getActiveChain(config: Config) {
  const chainId = config.state.chainId;
  return (
    config.chains.find((chain) => chain.id === chainId) ?? config.chains[0]
  );
}

function assertSupportedChain(config: Config) {
  const chain = getActiveChain(config);
  if (chain.network === "testnet") {
    throw new Error(
      "IOST testnet is currently unavailable. The exported testnet chain is kept for compatibility only."
    );
  }

  return chain;
}

function isTransactionShape(value: any): boolean {
  return !!value && typeof value === "object" && Array.isArray(value.actions);
}

function toNumber(
  value: unknown,
  fallback: number,
  { positiveOnly = false }: { positiveOnly?: boolean } = {}
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (positiveOnly && parsed <= 0) return fallback;
  return parsed;
}

function normalizeApproves(params: any) {
  const approves = Array.isArray(params?.approves) ? params.approves : [];
  return approves
    .filter(
      (item: any) =>
        item &&
        typeof item.token === "string" &&
        item.token.length > 0 &&
        item.amount != null
    )
    .map((item: any) => ({
      token: item.token,
      value: String(item.amount),
    }));
}

function normalizeSigners(params: any) {
  const rawSigners = Array.isArray(params?.signers) ? params.signers : [];
  const normalized = [];

  for (const signer of rawSigners) {
    if (
      signer &&
      typeof signer === "object" &&
      typeof signer.id === "string" &&
      signer.id.trim().length > 0
    ) {
      if (
        typeof signer.permission !== "string" ||
        signer.permission.trim().length === 0
      ) {
        throw new Error("contract signers must provide permission");
      }

      normalized.push({
        id: signer.id.trim(),
        permission: signer.permission.trim(),
      });
      continue;
    }

    throw new Error("contract signers must be objects with id and permission");
  }

  return normalized;
}

function normalizeToCallContractTx(params: any, defaultAccount?: string) {
  if (isTransactionShape(params)) return params;

  const actionName = typeof params?.action === "string" ? params.action : "";
  const contract = typeof params?.contract === "string" ? params.contract : "";
  const args = Array.isArray(params?.args) ? params.args : [];
  const publisher =
    typeof params?.publisher === "string" && params.publisher
      ? params.publisher
      : typeof params?.account === "string" && params.account
        ? params.account
        : defaultAccount ?? "";
  const amountLimit = normalizeApproves(params);
  const signers = normalizeSigners(params);

  return {
    gasRatio: toNumber(params?.gasRatio, 1, { positiveOnly: true }),
    gasLimit: toNumber(params?.gasLimit, 100000, { positiveOnly: true }),
    actions: [
      {
        contract,
        actionName,
        data: JSON.stringify(args),
      },
    ],
    signers,
    signatures: Array.isArray(params?.signatures) ? params.signatures : [],
    publisher,
    publisher_sigs: Array.isArray(params?.publisher_sigs)
      ? params.publisher_sigs
      : Array.isArray(params?.publisherSigs)
        ? params.publisherSigs
        : [],
    amount_limit: amountLimit,
    chain_id: toNumber(params?.chainID ?? params?.chain_id, 1024),
    ...(params?.time != null ? { time: toNumber(params.time, 0) } : {}),
    ...(params?.expiration != null
      ? { expiration: toNumber(params.expiration, 0) }
      : {}),
    ...(params?.delay != null ? { delay: toNumber(params.delay, 0) } : {}),
    ...(params?.referredTx ? { referredTx: params.referredTx } : {}),
    ...(params?.reserved != null ? { reserved: params.reserved } : {}),
    ...(params?.network ? { network: params.network } : {}),
    ...(params?.account ? { account: params.account } : {}),
  };
}

function createProviderRequest(provider: IWalletProvider, defaultAccount?: string) {
  return async (method: string, payload?: any) => {
    const rawParams = payload?.params ?? payload;
    // iWallet injected provider currently exposes `callContract` (not `writeContract`).
    // Normalize ivem wallet actions to wallet-supported method names.
    const normalizedMethod =
      method === "writeContract" || method === "callContract"
        ? "callContract"
        : method;

    const params =
      normalizedMethod === "callContract"
        ? normalizeToCallContractTx(rawParams, defaultAccount)
        : rawParams;

    return provider.request({ method: normalizedMethod, params });
  };
}

export async function getIvemWalletClient(
  config: Config
): Promise<IvemWalletClient> {
  const provider = await config.connector.getProvider();
  if (!provider) throw new Error("Provider not found");

  const chain = assertSupportedChain(config);
  const request = createProviderRequest(provider, config.state.accounts[0]);

  return createWalletClient({
    chain: {
      id: chain.id,
      name: chain.name,
      rpcUrls: chain.rpcUrls,
    },
    transport: custom({ request: request as any }),
  });
}
