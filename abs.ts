/**
 * equivaled of `Math.abs` but for `bigint` values
 *
 * @param value a `bigint` for which absolute value is needed
 * @returns absolute of `value`
 */
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
