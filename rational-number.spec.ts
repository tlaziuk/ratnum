/* eslint-disable @typescript-eslint/no-explicit-any */
import RationalNumber from './index'

describe(RationalNumber, () => {
  it.each<[any, number]>([
    [1, 1],
    [0, 0],
    [-1, -1],
    [1.5, 1.5],
    [0.5, 0.5],
    [-0.5, -0.5],
    [-1.5, -1.5],
    [[1, -5], -0.2],
    [[-1, -5], 0.2],
    [[-1, 5], -0.2],
    [[1, 5], 0.2],
    [[1, 2], 0.5],
    [{ numerator: 1, denominator: 1 }, 1],
    [{ numerator: -1, denominator: 1 }, -1],
    [{ numerator: -1, denominator: -1 }, 1],
    [{ numerator: 1, denominator: -1 }, -1],
    [{ numerator: 1, denominator: -2 }, -0.5],
    [{ numerator: 3, denominator: -2 }, -1.5],
    [{ numerator: -3, denominator: 2 }, -1.5],
    [{ numerator: 3, denominator: 2 }, 1.5],
    [{ numerator: 1, denominator: 2 }, 0.5],
    [1.11, 1.11],
    [-1.11, -1.11],
    ['2', 2],
    ['2.0', 2],
    ['-2.0', -2],
    [[1, 3], 0.3333333333333333],
    [[5, 6], 0.8333333333333333],
    [[1, 33], 0.0303030303030303],
    [[1, 55], 0.0181818181818181],
    [[1, 555], 0.0018018018018018],
  ])('expect RationalNumber(%p) to be %p', (value, result) => {
    expect(Number(new RationalNumber(value))).toEqual(result)
  })

  it.each<[any, any, number]>([
    [1, 1, 2],
    [1.1, 1.1, 2.2],
    [[2, 3], [1, 6], 0.8333333333333333],
  ])('expect RationalNumber(%p) + %p to be %p', (value, toAdd, result) => {
    expect(Number(new RationalNumber(value).add(toAdd))).toEqual(result)
  })

  it.each<[any, any, number]>([
    [1, 1, 0],
    [[1, 2], 1, -0.5],
    [[1, 2], [1, 4], 0.25],
    [2, [2, 3], 1.3333333333333333],
  ])('expect RationalNumber(%p) - %p to be %p', (value, toAdd, result) => {
    expect(Number(new RationalNumber(value).substract(toAdd))).toEqual(result)
  })

  it.each<[any, number]>([
    [1, 1],
    [[1, 2], 2],
    [[2, 3], 1.5],
    [2, 0.5],
  ])('expect RationalNumber(%p) inverse to be %p', (value, result) => {
    expect(Number(new RationalNumber(value).inverse())).toEqual(result)
  })

  it.each<[any, any, number]>([
    [1, 1, 1],
    [1, 2, 2],
    [3, [1, 3], 1],
    [6, [1, 3], 2],
    [1, [1, 3], 0.3333333333333333],
    [[3, 1], [1, 3], 1],
  ])('expect RationalNumber(%p) * %p to be %p', (value, toMultiply, result) => {
    expect(Number(new RationalNumber(value).multiply(toMultiply))).toEqual(result)
  })

  it.each<[any, any, number]>([
    [1, 1, 1],
    [1, 2, 0.5],
    [3, [1, 3], 9],
    [6, [1, 3], 18],
    [1, [1, 3], 3],
    [[3, 1], [1, 3], 9],
    [[1, 3], [1, 3], 1],
    [3, 10, 0.3],
  ])('expect RationalNumber(%p) / %p to be %p', (value, toMultiply, result) => {
    expect(Number(new RationalNumber(value).divide(toMultiply))).toEqual(result)
  })

  it.each<[any, any, number]>([
    [1, 1, 0],
    [2, 1, 0],
    [1, 2, 1],
    [3, -1.2, 0.6],
  ])('expect RationalNumber(%p) mod %p to be %p', (value, modulator, result) => {
    expect(Number(new RationalNumber(value).mod(modulator))).toEqual(result)
  })

  it.each<[any, number]>([
    [1, 1],
    [Math.PI, 3],
  ])('expect int(RationalNumber(%p)) to be %p', (value, result) => {
    expect(Number(new RationalNumber(value).int())).toEqual(result)
  })
})