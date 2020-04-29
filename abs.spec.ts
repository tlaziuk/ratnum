import abs from './abs'

describe(abs, () => {
  it.each<[bigint, bigint]>([
    [BigInt(1), BigInt(1)],
    [BigInt(-1), BigInt(1)],
    [BigInt(0), BigInt(0)],
  ])('expect abs(%p) to be %p', (value, result) => {
    expect(abs(value)).toEqual(result)
  })
})
