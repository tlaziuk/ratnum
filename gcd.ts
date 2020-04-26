import abs from './abs';

export function gcd(x: bigint, y: bigint): bigint {
  x = abs(x)
  y = abs(y)

  while(y) {

    const t = y;

    y = x % y;

    x = t;
  }

  return x;
}

export {
  gcd as default,
  gcd as greatestCommonDivisor,
}
