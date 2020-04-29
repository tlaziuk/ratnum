import abs from './abs';
import gcd from './gcd';

export function lcm(x: bigint, y: bigint): bigint {
  if (x === BigInt(0) || y === BigInt(0)) {
    return BigInt(0)
  }

  if (x === y) {
    return x
  }

  return abs((x * y) / gcd(x, y));
}

export {
  lcm as default,
  lcm as leastCommonMultiple,
}
