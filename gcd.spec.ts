import gcd from './gcd'

describe(gcd, () => {
  it.each<[bigint, bigint, bigint]>([
    [BigInt(1), BigInt(1), BigInt(1)],
    [BigInt(1), BigInt(2), BigInt(1)],
    [BigInt(6), BigInt(4), BigInt(2)],
    [BigInt(6), BigInt(-2), BigInt(2)],
  ])('expect gcd(%p, %p) to be %p', (x, y, result) => {
    expect(gcd(x, y)).toEqual(result)
  })
})
