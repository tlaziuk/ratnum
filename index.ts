import greatestCommonDivisor from './gcd'

export interface RationalNumberLike<T extends (number | string | bigint) = (number | string | bigint)> {
  readonly nominator: T;
  readonly denominator: T;
}

function isRationalNumberLike(value: unknown): value is RationalNumberLike {
  if (typeof value !== 'undefined' && value !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeofNominator = typeof (value as any).nominator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeofDenominator = typeof (value as any).denominator

    return (
      typeofDenominator === 'string'
      || typeofDenominator === 'number'
      || typeofDenominator === 'bigint'
    )
      && (
        typeofNominator === 'string'
        || typeofNominator === 'number'
        || typeofNominator === 'bigint'
      )
  }

  return false
}

type ParsableValue = number | string | bigint | RationalNumberLike | [number | string | bigint, number | string | bigint]

function normalizeValue({ nominator, denominator }: RationalNumberLike<bigint>): RationalNumberLike<bigint> {
  if (denominator === 0n) {
    throw new RangeError(`Division by zero`)
  }

  if (denominator < 0) {
    nominator *= -1n
    denominator *= -1n
  }

  return {
    nominator,
    denominator,
  }
}

function parseValue(value: ParsableValue): RationalNumberLike<bigint> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (value instanceof RationalNumber) {
    return value
  }

  let nominator: bigint
  let denominator: bigint

  if (Array.isArray(value)) {
    nominator = BigInt(value[0])
    denominator = BigInt(value[1])
  } else if (isRationalNumberLike(value)) {
    nominator = BigInt(value.nominator)
    denominator = BigInt(value.denominator)
  } else if (typeof value === 'bigint' || (typeof value === 'number' && Number.isInteger(value))) {
    nominator = BigInt(value)
    denominator = 1n
  } else {
    value = `${value}`

    const isNegative = value.startsWith('-')

    if (isNegative || value.startsWith('+')) {
      value = value.substr(1)
    }

    const [decimal = '', fraction = ''] = value.split('.')
    const fractionDigits = fraction.length

    denominator = BigInt(`1${'0'.repeat(fractionDigits)}`)
    nominator = ((BigInt(decimal) * denominator) + BigInt(fraction)) * (isNegative ? -1n : 1n)
  }

  return normalizeValue({
    nominator,
    denominator,
  })
}

function stringify(value: RationalNumberLike<bigint>, precision = 16): string {
  value = normalizeValue(value)
  let nominator = value.nominator
  const denominator = value.denominator
  const isNegative = nominator < 0n

  if (isNegative) {
    nominator *= -1n
  }

  const decimal = (nominator / denominator)

  let denominatorFraction = (nominator % denominator) * 10n

  let fraction = ''

  while (denominatorFraction !== 0n && fraction.length < precision) {
    const tmp = denominatorFraction / denominator

    if (tmp > 0n) {
      denominatorFraction = (denominatorFraction % denominator) * 10n
    } else {
      denominatorFraction *= 10n
    }

    fraction += tmp.toString()
  }

  return `${isNegative ? '-' : ''}${decimal}${fraction.length > 0 ? `.${fraction}` : ''}`
}

const values = new WeakMap<RationalNumber, { nominator: bigint; denominator: bigint }>()

function getValueBag(key: RationalNumber): { nominator: bigint; denominator: bigint } {
  if (values.has(key)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return values.get(key)!
  }

  const value = { nominator: 0n, denominator: 1n }

  values.set(key, value)

  return value
}

/**
 * ```
 * NOMINATOR
 * ---
 * DENOMINATOR
 * ```
 */
export default class RationalNumber implements RationalNumberLike<bigint> {
  constructor(value: ParsableValue) {
    const bag = getValueBag(this);

    ({
      denominator: bag.denominator,
      nominator: bag.nominator,
    } = parseValue(value))
  }

  public get nominator(): bigint {
    return getValueBag(this).nominator
  }

  public get denominator(): bigint {
    return getValueBag(this).denominator
  }

  public valueOf(): number {
    return Number(stringify(this))
  }
  public toString(precision?: number): string {
    return stringify(this, precision)
  }

  public toJSON(): number {
    return Number(stringify(this))
  }

  public add(value: ParsableValue): RationalNumber {
    const { denominator: aDenominator, nominator: aNominator } = parseValue(value)
    const { denominator: bDenominator, nominator: bNominator } = getValueBag(this)

    const denominator = aDenominator * bDenominator
    const nominator = (aNominator * (denominator / aDenominator)) + (bNominator * (denominator / bDenominator))

    const gcd = greatestCommonDivisor(nominator, denominator)

    return new RationalNumber({
      denominator: denominator / gcd,
      nominator: nominator / gcd,
    })
  }

  public substract(value: ParsableValue): RationalNumber {
    const { nominator, denominator } = parseValue(value)

    return this.add({ nominator: nominator * -1n, denominator })
  }

  public inverse(): RationalNumber {
    const { nominator, denominator } = getValueBag(this)

    return new RationalNumber({
      nominator: denominator,
      denominator: nominator,
    })
  }

  public multiply(value: ParsableValue): RationalNumber {
    const { denominator: aDenominator, nominator: aNominator } = parseValue(value)
    const { denominator: bDenominator, nominator: bNominator } = getValueBag(this)

    const denominator = aDenominator * bDenominator
    const nominator = aNominator * bNominator

    const gcd = greatestCommonDivisor(nominator, denominator)

    return new RationalNumber({
      denominator: denominator / gcd,
      nominator: nominator / gcd,
    })
  }

  public divide(value: ParsableValue): RationalNumber {
    const { nominator, denominator } = parseValue(value)

    return this.multiply({
      nominator: denominator,
      denominator: nominator,
    })
  }
}
