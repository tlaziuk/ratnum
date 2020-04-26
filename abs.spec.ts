import abs from './abs'

describe(abs, () => {
  it.each<[bigint, bigint]>([
    [1n, 1n],
    [-1n, 1n],
    [0n, 0n],
  ])('expect abs(%p) to be %p', (value, result) => {
    expect(abs(value)).toEqual(result)
  })
})
