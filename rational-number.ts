import greatestCommonDivisor from './gcd'

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

  if (denominator < 0) {
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

    ({
      denominator: bag.denominator,
      numerator: bag.numerator,
    } = parseValue(value))
  }

  public get numerator(): bigint {
    return getValueBag(this).numerator
  }

  public get denominator(): bigint {
    return getValueBag(this).denominator
  }

  public valueOf(): number {
    return Number(stringify(this, 16))
  }

  public toString(): string {
    return stringify(this, 16)
  }

  public toFixed(precision: number): string {
    return stringify(this, precision)
  }

  public toJSON(): number {
    return Number(stringify(this, 16))
  }

  public add(value: ParsableValue): RationalNumber {
    const { denominator: aDenominator, numerator: aNumerator } = parseValue(value)
    const { denominator: bDenominator, numerator: bNumerator } = getValueBag(this)

    const denominator = aDenominator * bDenominator
    const numerator = (aNumerator * (denominator / aDenominator)) + (bNumerator * (denominator / bDenominator))

    const gcd = greatestCommonDivisor(numerator, denominator)

    return new RationalNumber({
      denominator: denominator / gcd,
      numerator: numerator / gcd,
    })
  }

  public substract(value: ParsableValue): RationalNumber {
    const { numerator, denominator } = parseValue(value)

    return this.add({ numerator: numerator * BigInt(-1), denominator })
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

    const gcd = greatestCommonDivisor(numerator, denominator)

    return new RationalNumber({
      denominator: denominator / gcd,
      numerator: numerator / gcd,
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
    return new RationalNumber(this.numerator / this.denominator)
  }

  public mod(value: ParsableValue): RationalNumber {
    const modulator = new RationalNumber(value)

    return this.substract(
      modulator.multiply(
        this.divide(modulator).int(),
      ),
    )
  }
}
