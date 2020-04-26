import lcm from './lcm'

describe(lcm, () => {
  it.each<[bigint, bigint, bigint]>([
    [1n, 1n, 1n],
    [2n, 4n, 4n],
    [6n, 4n, 12n],
  ])('expect lcm(%p, %p) to be %p', (x, y, result) => {
    expect(lcm(x, y)).toEqual(result)
  })
})
