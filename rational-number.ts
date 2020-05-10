import greatestCommonDivisor from './gcd'
import integerNthRoot from './integer-nth-root'

export interface RationalNumberLike<T extends (number | string | bigint) = (number | string | bigint)> {
  readonly numerator: T;
  readonly denominator: T;
}

function isRationalNumberLike(value: unknown): value is RationalNumberLike {
  if (typeof value !== 'undefined' && value !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeofNumerator = typeof (value as any).numerator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeofDenominator = typeof (value as any).denominator

    return (
      typeofDenominator === 'string'
      || typeofDenominator === 'number'
      || typeofDenominator === 'bigint'
    )
      && (
        typeofNumerator === 'string'
        || typeofNumerator === 'number'
        || typeofNumerator === 'bigint'
      )
  }

  return false
}

type ParsableValue = number | string | bigint | RationalNumberLike | [number | string | bigint, number | string | bigint]

function normalizeValue({ numerator, denominator }: RationalNumberLike<bigint>): RationalNumberLike<bigint> {
  if (denominator === BigInt(0)) {
    throw new RangeError(`Division by zero`)
  }

  if (denominator < BigInt(0)) {
    numerator *= BigInt(-1)
    denominator *= BigInt(-1)
  }

  return {
    numerator,
    denominator,
  }
}

function parseValue(value: ParsableValue): RationalNumberLike<bigint> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (value instanceof RationalNumber) {
    return value
  }

  let numerator: bigint
  let denominator: bigint

  if (Array.isArray(value)) {
    numerator = BigInt(value[0])
    denominator = BigInt(value[1])
  } else if (isRationalNumberLike(value)) {
    numerator = BigInt(value.numerator)
    denominator = BigInt(value.denominator)
  } else if (typeof value === 'bigint' || (typeof value === 'number' && Number.isInteger(value))) {
    numerator = BigInt(value)
    denominator = BigInt(1)
  } else {
    value = `${value}`

    const isNegative = value.startsWith('-')

    if (isNegative || value.startsWith('+')) {
      value = value.substr(1)
    }

    const [decimal = '', fraction = ''] = value.split('.')
    const fractionDigits = fraction.length

    denominator = BigInt(`1${'0'.repeat(fractionDigits)}`)
    numerator = ((BigInt(decimal) * denominator) + BigInt(fraction)) * BigInt(isNegative ? -1 : 1)
  }

  return normalizeValue({
    numerator,
    denominator,
  })
}

function stringify(value: RationalNumberLike<bigint>, precision: number): string {
  value = normalizeValue(value)
  let numerator = value.numerator
  const denominator = value.denominator
  const isNegative = numerator < BigInt(0)

  if (isNegative) {
    numerator *= BigInt(-1)
  }

  const decimal = (numerator / denominator)

  let denominatorFraction = (numerator % denominator) * BigInt(10)

  let fraction = ''

  while (denominatorFraction !== BigInt(0) && fraction.length < precision) {
    const tmp = denominatorFraction / denominator

    if (tmp > BigInt(0)) {
      denominatorFraction = (denominatorFraction % denominator) * BigInt(10)
    } else {
      denominatorFraction *= BigInt(10)
    }

    fraction += tmp.toString()
  }

  return `${isNegative ? '-' : ''}${decimal}${fraction.length > 0 ? `.${fraction}` : ''}`
}

const values = new WeakMap<RationalNumber, { numerator: bigint; denominator: bigint }>()

function getValueBag(key: RationalNumber): { numerator: bigint; denominator: bigint } {
  if (values.has(key)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return values.get(key)!
  }

  const value = { numerator: BigInt(0), denominator: BigInt(1) }

  values.set(key, value)

  return value
}

/**
 * ```
 * NUMERATOR
 * ---
 * DENOMINATOR
 * ```
 */
export default class RationalNumber implements RationalNumberLike<bigint> {
  constructor(value: ParsableValue) {
    const bag = getValueBag(this);

    const { numerator, denominator } = parseValue(value)

    const gcd = greatestCommonDivisor(numerator, denominator)

    bag.numerator = numerator / gcd
    bag.denominator = denominator / gcd
  }

  public get numerator(): bigint {
    return getValueBag(this).numerator
  }

  public get denominator(): bigint {
    return getValueBag(this).denominator
  }

  /**
  * `Number()` overload
  */
  public valueOf(): number {
    return Number(stringify(this, 16))
  }

  public toString(): string {
    return stringify(this, 16)
  }

  public toFixed(precision: number): string {
    return stringify(this, precision)
  }

  /**
   * re-creates `RationalNumber` instance from previously serialized value
   */
  public static fromJSON(value: string): RationalNumber {
    const [numerator, denominator] = value.split('/')

    return new this({ numerator, denominator })
  }

  /**
   * serialize value to JSON, this method is meant to be used indirectly by `JSON.serialize`
   */
  public toJSON(): string {
    const { numerator, denominator } = getValueBag(this)

    return `${numerator}/${denominator}`
  }

  public add(value: ParsableValue): RationalNumber {
    const { denominator: aDenominator, numerator: aNumerator } = parseValue(value)

    if (aNumerator === BigInt(0)) {
      return this
    }

    const { denominator: bDenominator, numerator: bNumerator } = getValueBag(this)

    const denominator = aDenominator * bDenominator
    const numerator = (aNumerator * (denominator / aDenominator)) + (bNumerator * (denominator / bDenominator))

    return new RationalNumber({
      denominator,
      numerator,
    })
  }

  public substract(value: ParsableValue): RationalNumber {
    const { numerator, denominator } = parseValue(value)

    return this.add({
      numerator: numerator * BigInt(-1),
      denominator,
    })
  }

  public inverse(): RationalNumber {
    const { numerator, denominator } = getValueBag(this)

    return new RationalNumber({
      numerator: denominator,
      denominator: numerator,
    })
  }

  public multiply(value: ParsableValue): RationalNumber {
    const { denominator: aDenominator, numerator: aNumerator } = parseValue(value)
    const { denominator: bDenominator, numerator: bNumerator } = getValueBag(this)

    const denominator = aDenominator * bDenominator
    const numerator = aNumerator * bNumerator

    return new RationalNumber({
      denominator,
      numerator,
    })
  }

  public divide(value: ParsableValue): RationalNumber {
    const { numerator, denominator } = parseValue(value)

    return this.multiply({
      numerator: denominator,
      denominator: numerator,
    })
  }

  public int(): RationalNumber {
    const {
      numerator,
      denominator,
    } = getValueBag(this)

    return new RationalNumber(numerator / denominator)
  }

  public mod(value: ParsableValue): RationalNumber {
    const modulator = value instanceof RationalNumber ? value : new RationalNumber(value)

    return this.substract(
      modulator.multiply(
        this.divide(modulator).int(),
      ),
    )
  }

  public abs(): RationalNumber {
    const { numerator, denominator } = getValueBag(this)

    if (numerator < BigInt(0)) {
      return new RationalNumber({ numerator: -numerator, denominator })
    }

    return this
  }

  public power(exponent: ParsableValue, precision = BigInt(16)): RationalNumber {
    const rationalExponent = parseValue(exponent)

    // x ** 0
    if (rationalExponent.numerator === BigInt(0)) {
      return new RationalNumber(1)
    }

    // x ** 1
    if (rationalExponent.numerator === rationalExponent.denominator) {
      return this
    }

    // x ** n, where n < 0
    if (rationalExponent.numerator < BigInt(0)) {
      return this.inverse().power({
        numerator: -rationalExponent.numerator,
        denominator: rationalExponent.denominator,
      })
    }

    const numerator = this.numerator ** rationalExponent.numerator
    const denominator = this.denominator ** rationalExponent.numerator

    const result = new RationalNumber({ numerator, denominator })

    // exponent is not an integer
    if (rationalExponent.denominator !== BigInt(1)) {
      return result.root(rationalExponent.denominator, precision)
    }

    return result
  }

  /**
   * @see https://en.wikipedia.org/wiki/Nth_root_algorithm
   */
  public root(degree: string | number | bigint, precision = BigInt(16)): RationalNumber {
    // root(x, n), where x < 0
    if (this.numerator < BigInt(0)) {
      throw new RangeError('rooting not allowed on negative numbers')
    }

    degree = typeof degree === 'bigint' ? degree : BigInt(degree)

    // root(x, n), where n <= 0
    if (degree <= BigInt(0)) {
      throw new RangeError('root degree has to be greater than 0')
    }

    // root(0, n)
    if (this.numerator === BigInt(0)) {
      return this
    }

    // root(x, 1)
    if (degree === BigInt(1)) {
      return this
    }

    let current: RationalNumber = this.divide(degree)

    /**
     * it's a shortcut for calculating roots of integers,
     * in some cases (eg. `root(9, 3)`) the standard approach may never be finished nor return the correct result,
     * because the Newton-Rhapson method uses calculus which means in each iteration it is only getting closer to the actual result which may be never reached,
     * in the example above (`root(9, 3)`) obviously equals `3`,
     * but when using rational numbers instead of integers the result is not achieved in a rational amount of iterations
     *
     * when `denominator === 1` the number is an integer
     */
    if (this.denominator === BigInt(1)) {
      current = new RationalNumber(integerNthRoot(this.numerator, degree))

      // validation
      if (current.numerator ** degree === this.numerator) {
        return current
      }
    } else {
      current = this.divide(degree)
    }

    let iteration = BigInt(0)
    let previous: RationalNumber

    const multiper = new RationalNumber({ numerator: 1, denominator: degree })
    const degreeMinusOne = new RationalNumber(degree - BigInt(1))

    do {
      previous = current
      current = multiper.multiply(previous.multiply(degreeMinusOne).add(this.divide(previous.power(degreeMinusOne))))
      iteration++
    } while (iteration < precision && !(previous.numerator === current.numerator && previous.denominator === current.denominator))

    return current
  }
}
