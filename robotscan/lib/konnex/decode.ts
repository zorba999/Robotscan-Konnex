/** Decode a 0x-prefixed hex string into UTF-8. */
export function hexToUtf8(hex: string | null | undefined): string {
  if (!hex || typeof hex !== "string") return "";
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length === 0) return "";
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(
      new Uint8Array(bytes),
    );
  } catch {
    return "";
  }
}

/** Convert a Substrate u32 IPv4 representation to dotted notation. */
export function ipFromU32(n: number | bigint | string): string {
  const num = typeof n === "string" ? Number(n) : Number(n);
  if (!Number.isFinite(num) || num <= 0) return "";
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

/** Format a Subtensor RAO/Alpha amount (9 decimals) as a human-readable string. */
export function formatTKnx(rao: bigint | string | number, decimals = 9): string {
  const big =
    typeof rao === "bigint" ? rao : BigInt(typeof rao === "number" ? Math.trunc(rao) : rao);
  const divisor = BigInt(10 ** decimals);
  const whole = big / divisor;
  const frac = big % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole.toLocaleString("en-US")}.${fracStr}`;
}

/** Convert RAO bigint to a JS number tKNX (loses precision for huge values). */
export function raoToTknx(rao: bigint | string | number, decimals = 9): number {
  const big =
    typeof rao === "bigint" ? rao : BigInt(typeof rao === "number" ? Math.trunc(rao) : rao);
  return Number(big) / 10 ** decimals;
}
