import { keccak256, stringToHex } from "viem";

function stableStringifyValue(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringifyValue).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringifyValue(record[key])}`).join(",")}}`;
}

export function stableStringify(value: unknown) {
  return stableStringifyValue(value);
}

export function metadataHash(value: unknown): `0x${string}` {
  return keccak256(stringToHex(stableStringify(value)));
}
