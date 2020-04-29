import abs from './abs';

export function gcd(x: bigint, y: bigint): bigint {
  x = abs(x)
  y = abs(y)

  while (y) {
    ([y, x] = [x % y, y])
  }

  return x;
}

export {
  gcd as default,
  gcd as greatestCommonDivisor,
}
