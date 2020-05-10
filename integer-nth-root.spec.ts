import integerNthRoot from './integer-nth-root'

describe(integerNthRoot, () => {
  it.each<[bigint, bigint, bigint]>([
    [BigInt(1), BigInt(1), BigInt(1)],
    [BigInt(2), BigInt(2), BigInt(1)],
    [BigInt(4), BigInt(2), BigInt(2)],
    [BigInt(8), BigInt(3), BigInt(2)],
    [BigInt(625), BigInt(4), BigInt(5)],
    [BigInt(16), BigInt(4), BigInt(2)],
    [BigInt(27), BigInt(3), BigInt(3)],
  ])('expect root(%p, %p) to equals %p', (radicant, degree, result) => {
    expect(integerNthRoot(radicant, degree)).toEqual(result)
  })
})
