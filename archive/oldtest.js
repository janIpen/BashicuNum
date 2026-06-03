import { Matrix, Column } from "./BMSNum.js";

const zero = new Matrix([]);
const one = new Matrix([[0]]);
const two = new Matrix([[0], [0]]);
const nine = new Matrix([[0], [0], [0], [0], [0], [0], [0], [0], [0]]);
const ten = new Matrix([[0], [1]]);
const hundred = new Matrix([[0], [1], [1]]);

// console.log(ten.toString());
// console.log(ten.add(one).toString());

// // "collapsing"
// console.log(nine.add(one).toString());

// console.log(hundred.add(hundred).toString());
// console.log(
//     hundred
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .add(hundred)
//         .toString(),
// );

// // performance (not impressive)
// let t0, t1, n;
// // counting to a thousand
// t0 = performance.now();
// n = zero;
// for (let i = 0; i < 1000; i++) {
//     n = n.add(one);
// }
// console.log(n.toString());
// t1 = performance.now();
// console.log(`counting to 1000 took ${t1 - t0} milliseconds.`);

// // counting to a million (may take up to a minute)
// t0 = performance.now();
// n = zero;
// for (let i = 0; i < 1e6; i++) {
//     n = n.add(one);
// }
// console.log(n.toString());
// t1 = performance.now();
// console.log(`counting to 1e6 took ${t1 - t0} milliseconds.`);

console.log(new Column([0, 0, 0]).toString());
