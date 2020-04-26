import abs from './abs';
import gcd from './gcd';

export function lcm(x: bigint, y: bigint): bigint {
  if (x === 0n || y === 0n) {
    return 0n
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
