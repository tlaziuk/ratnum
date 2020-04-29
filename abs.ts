export function abs(value: bigint): bigint {
  if (value < BigInt(0)) {
    return value * BigInt(-1)
  }

  return value
}

export {
  abs as default,
  abs as absolute,
}
