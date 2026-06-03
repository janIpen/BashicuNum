# BashicuNum.js

> name pending, I kinda want it to follow all the `<funnyadjective>Num.js` like `OmegaNum.js`, `ExpantaNum.js`, `MetaNum.js`, etc..

## Example Usage

```js
import { BashicuNumber } from './BashicuNum.js'
let one = BashicuNumber(1)
let maxDirectNum = BashicuNumber(1)
let two = one.add(one)
let ten = one.pow10()
console.log(ten.toString())
```
```
BashicuNumber { matrix: (0), value: 1 }
```

sample usage can be found in [`./test.js`](./test.js)

## Internals

Implements solarzone's idea, where you store numbers as matrix-value pairs:
```
() x = x
(0) x = 10^x
(0)(0) x = 10^10^x
...
```
where 1 <= x < 10
For limit expressions, we have:
```
(0)(1) x+y = (0)(1)[x] 10^y where x is the integer part and y is the decimal part and 1 <= x+y < 10
```
Maybe in another world it would be `(0)(1)[10^x] 10^y` but I dont want to deal with having to deal with matrices of length 10^9+

The system is set up in a way that all normalized BashicuNumber matrices are successor matrices rather than limit matrices (I think)

## TODO

- [ ] `Matrix.expand()`
- [ ] `BashicuNum.log10()`
- [ ] `BashicuNum.mult()`
- [ ] `BashicuNum.exp()` and higher operations ??
- [ ] typescript?

Contributions welcome