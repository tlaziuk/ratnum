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

  if (denominator === BigInt(0)) {
    throw new RangeError(`Division by zero: ${numerator}/${denominator}`)
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

function stringify({ numerator, denominator }: RationalNumberLike<bigint>, precision: number, fixed = false): string {
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

  if (fixed && fraction.length !== precision) {
    fraction = fraction.padEnd(precision, '0')
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
 * an arbitrary precision number, where you can distinguish a numerator and a denominator: `numerator/denominator`
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

  /**
  * `String()` overload
  */
  public toString(): string {
    return stringify(this, 16)
  }

  /**
   * `Number.toFixed()` equivalent
   * @param precision fixed-point precision
   * @return a string representing a number in fixed-point notation
   */
  public toFixed(precision: number): string {
    return stringify(this, precision, true)
  }

  /**
   * re-creates `RationalNumber` instance from previously serialized value
   */
  public static fromJSON(value: string): RationalNumber {
    const [numerator, denominator] = value.split('/')

    return new this({ numerator, denominator })
  }

  /**
   * serialize value to JSON string by adding a `/` separator between numerator and denominator
   *
   * this method is meant to be used indirectly by `JSON.serialize`
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

    if (numerator === BigInt(0) || numerator === denominator) {
      return this
    }

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

    if (numerator === BigInt(0)) {
      throw new RangeError(`Can not divide ${this} by 0`)
    }

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

  /**
   * raise this value to given exponent
   */
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
  public root(degree: ParsableValue, precision = BigInt(16)): RationalNumber {
    // root(x, n), where x < 0
    if (this.numerator < BigInt(0)) {
      throw new RangeError('rooting not allowed on a negative radicand')
    }

    // root(1, n)
    // root(0, n)
    if (this.numerator === this.denominator || this.numerator === BigInt(0)) {
      return this
    }

    const rationalDegree = parseValue(degree)

    // root(x, n), where n < 0
    if (rationalDegree.numerator < BigInt(0)) {
      return this.inverse().root({
        numerator: -rationalDegree.numerator,
        denominator: rationalDegree.denominator,
      })
    }

    // root(x, 0)
    if (rationalDegree.numerator === BigInt(0)) {
      throw new RangeError('root degree can not be equal to 0')
    }

    // root(x, 1)
    if (rationalDegree.numerator === rationalDegree.denominator) {
      return this
    }

    let current: RationalNumber

    /**
     * it's a shortcut for calculating roots of integers,
     * in some cases (eg. `root(9, 3)`) the standard approach may never be finished nor return the correct result,
     * because the Newton-Rhapson method uses calculus which means in each iteration it is only getting closer to the actual result which may be never reached,
     * in the example above (`root(9, 3)`) obviously equals `3`,
     * but when using rational numbers instead of integers the result is not achieved in a rational amount of iterations
     *
     * when `denominator === 1` the number is an integer
     */
    if (this.denominator === BigInt(1) && (rationalDegree.numerator % rationalDegree.denominator === BigInt(0))) {
      const degreeInt = rationalDegree.numerator / rationalDegree.denominator

      current = new RationalNumber(integerNthRoot(this.numerator, degreeInt))

      // validation
      if (current.numerator ** degreeInt === this.numerator) {
        return current
      }
    } else {
      current = new RationalNumber(1)
    }

    let iteration = BigInt(0)
    let previous: RationalNumber = current

    const multiper = new RationalNumber({
      numerator: rationalDegree.denominator,
      denominator: rationalDegree.numerator,
    })
    const degreeMinusOne = new RationalNumber({
      numerator: rationalDegree.numerator - rationalDegree.denominator,
      denominator: rationalDegree.denominator,
    })

    do {
      previous = current
      current = multiper.multiply(previous.multiply(degreeMinusOne).add(this.divide(previous.power(degreeMinusOne))))
      iteration++
    } while (iteration < precision && !(previous.numerator === current.numerator && previous.denominator === current.denominator))

    return current
  }
}
