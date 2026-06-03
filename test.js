import { Column, Matrix, BashicuNumber } from "./BashicuNum.js";

let one = new BashicuNumber(1);
let big = new BashicuNumber(9e15);
// console.log(one.toString());
// console.log(big.toString());
// console.log(new BashicuNumber(9e15));

let two = one.add(one);
// console.log(two.toString());

let ten = two.add(one).add(one).add(one).add(one).add(one).add(one).add(one).add(one);
console.log(ten.toString());

// let ten = new BashicuNumber(10);
// console.log(ten.toString());
// console.log(ten.pow10().toString());
// let midplusone = mid.add(one);
// console.log(midplusone.toString());

// console.log(new Column([0, 0, 0]) instanceof Column);

let tenten = ten.pow10().pow10().pow10().pow10().pow10().pow10().pow10().pow10().pow10();
console.log(tenten.toString());

console.log(tenten.pow10().toString());

let ord = new Matrix([[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]]);
let collapse = ord.collapse();
console.log(`${ord.toString()} = ${collapse.newMatrix.toString()}[${collapse.n}]`);

ord = new Matrix([
    [0, 0],
    [1, 1],
    [2, 2],
]);
collapse = ord.collapse();
console.log(`(0,0)(1,1)(2,2) = ${collapse.newMatrix.toString()}[${collapse.n}]`);
