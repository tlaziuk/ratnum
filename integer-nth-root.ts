/**
 * implementation assumes all passed values are valid
 * @see https://en.wikipedia.org/wiki/Nth_root_algorithm
 * @param radicand base for rooting, > 0
 * @param degree root degree, > 1
 */
export default function integerNthRoot(radicand: bigint, degree: bigint): bigint {
  const one = BigInt(1)
  let previous: bigint
  let current: bigint = one

  do {
    previous = current
    current = (((degree - one) * previous) + (radicand / (previous ** (degree - one)))) / degree
  } while (previous !== current)

  return current
}
