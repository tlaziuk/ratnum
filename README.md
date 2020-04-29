# ratnum
arbitrary-precision arithmetics in JavaScript
---

this library is based on `bigint` type so it's precision has virtually the same limitations as `bigint` limitations

## `0.1 + 0.2 === 0.30000000000000004`?
NO MORE
---
if you need to perform a precise calculation just use this library, and it looks like this:
``` TypeScript
import RationalNumber from 'ratnum'

console.log(Number(new RationalNumber(0.1).add(0.2)))
/// 0.3
```
*view the test files for more usage examples*

unfortunately JavaScript has poor support of operator overloading so you'll be forced to use those ugly methods like `.add`, `.substract`, etc., but simple overloads like `.toString` (`String(...)`), `valueOf` (`Number(...)`) and `toJSON` (`JSON.stringify(...)`) are supported

**pull-requests and suggestions are welcomed**
