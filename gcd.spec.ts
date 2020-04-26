import gcd from './gcd'

describe(gcd, () => {
  it.each<[bigint, bigint, bigint]>([
    [1n, 1n, 1n],
    [1n, 2n, 1n],
    [6n, 4n, 2n],
    [6n, -2n, 2n],
  ])('expect gcd(%p, %p) to be %p', (x, y, result) => {
    expect(gcd(x, y)).toEqual(result)
  })
})
