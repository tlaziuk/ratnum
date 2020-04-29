import lcm from './lcm'

describe(lcm, () => {
  it.each<[bigint, bigint, bigint]>([
    [BigInt(1), BigInt(1), BigInt(1)],
    [BigInt(2), BigInt(4), BigInt(4)],
    [BigInt(6), BigInt(4), BigInt(12)],
  ])('expect lcm(%p, %p) to be %p', (x, y, result) => {
    expect(lcm(x, y)).toEqual(result)
  })
})
