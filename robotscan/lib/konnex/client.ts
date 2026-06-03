import "server-only";
import { ApiPromise, WsProvider } from "@polkadot/api";

const ENDPOINT =
  process.env.KONNEX_RPC_URL ?? "wss://testnet-rpc1.konnex.world:39944";

type ApiCache = {
  promise: Promise<ApiPromise> | null;
  api: ApiPromise | null;
  lastErrorAt: number;
};

const g = globalThis as unknown as { __konnex?: ApiCache };
g.__konnex ??= { promise: null, api: null, lastErrorAt: 0 };
const cache = g.__konnex;

const ERROR_COOLDOWN_MS = 15_000;

export async function getApi(): Promise<ApiPromise | null> {
  if (cache.api && cache.api.isConnected) return cache.api;
  if (cache.promise) return cache.promise;
  if (Date.now() - cache.lastErrorAt < ERROR_COOLDOWN_MS) return null;

  cache.promise = (async () => {
    try {
      const provider = new WsProvider(ENDPOINT, 5000);
      const api = await ApiPromise.create({
        provider,
        throwOnConnect: true,
        noInitWarn: true,
      });
      cache.api = api;
      api.on("disconnected", () => {
        cache.api = null;
      });
      api.on("error", () => {
        cache.lastErrorAt = Date.now();
      });
      return api;
    } catch (err) {
      cache.lastErrorAt = Date.now();
      console.warn("[konnex] connect failed:", (err as Error)?.message ?? err);
      throw err;
    } finally {
      cache.promise = null;
    }
  })();

  try {
    return await cache.promise;
  } catch {
    return null;
  }
}

export async function withApi<T>(
  fn: (api: ApiPromise) => Promise<T>,
  fallback: T,
): Promise<{ value: T; live: boolean; error?: string }> {
  try {
    const api = await getApi();
    if (!api) return { value: fallback, live: false, error: "rpc-unavailable" };
    const value = await fn(api);
    return { value, live: true };
  } catch (err) {
    cache.lastErrorAt = Date.now();
    return {
      value: fallback,
      live: false,
      error: (err as Error)?.message ?? "rpc-error",
    };
  }
}

export const RPC_ENDPOINT = ENDPOINT;
