export function abs(value: bigint): bigint {
  if (value < 0n) {
    return value * -1n
  }

  return value
}

export {
  abs as default,
  abs as absolute,
}
