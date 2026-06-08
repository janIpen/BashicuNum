import { Column, Matrix, BashicuNumber } from "./BashicuNum.js";

// rudimentary column test
function columnTest() {
    try {
        console.log("Testing Column Class");
        let c1 = new Column([0, 0, 0, 0, 0]);
        if (c1.toString() == "(0,0,0,0,0)") console.log("test 1 passed");
        else console.log(`test 1 failed`);
        if (c1.toString(2) == "(0,0)") console.log("test 2 passed");
        else console.log(`test 2 failed`);
        if (c1.toString(6) == "(0,0,0,0,0,0)") console.log("test 3 passed");
        else console.log(`test 3 failed`);
        if (c1.height == 1) console.log("test 4 passed");
        else console.log(`test 4 failed`);
        // TODO: make test for column comparisons, gt, eq, lt
    } catch (e) {
        console.error(e);
    }
}
columnTest();

function matrixTest() {
    console.log("Testing Matrix class");
    let m1 = new Matrix([[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]]);
    let m2 = new Matrix([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
    ]);
    let m3 = new Matrix([
        [0, 0],
        [1, 1],
        [2, 1],
        [3, 0],
        [4, 1],
        [5, 1],
        [6, 0],
        [7, 1],
        [8, 1],
    ]);
    let m4 = new Matrix([
        [0, 0, 0],
        [1, 1, 1],
    ]);

    // rows test
    if (m1.rows === 1) console.log("✅ matrix rows test 1 passed");
    else {
        console.log("❌ matrix rows test 1 failed");
        console.log("rows of (0)(0)(0)(0)(0)(0)(0)(0)(0)(0)");
        console.log(`expected: 1`);
        console.log(`received: ${m1.rows}`);
    }
    if (m2.rows === 2) console.log("✅ matrix rows test 2 passed");
    else {
        console.log("❌ matrix rows test 2 failed");
        console.log("rows of (0,0)(1,1)(2,2)(3,3)(4,4)");
        console.log(`expected: 2`);
        console.log(`received: ${m1.rows}`);
    }

    // comparisons
    console.assert(new Matrix([[0], [0], [0], [0], [0]]).gt(new Matrix([[0], [0], [0]])));

    // expand
    if (m1.expand(3).toString() === "(0)(0)(0)(0)(0)(0)(0)(0)(0)") console.log("✅ matrix expand test 1 passed");
    else {
        console.log("❌ matrix expand test 1 failed");
        console.log("(0)(0)(0)(0)(0)(0)(0)(0)(0)(0)[3] = ?");
        console.log(`expected output: (0)(0)(0)(0)(0)(0)(0)(0)(0)`);
        console.log(`received output: ${m1.expand(3).toString()}`);
    }
    if (m2.expand(3).toString() === "(0,0)(1,1)(2,2)(3,3)(4,3)(5,3)(6,3)")
        console.log("✅ matrix expand test 2 passed");
    else {
        console.log("❌ matrix expand test 2 failed");
        console.log("(0,0)(1,1)(2,2)(3,3)(4,4)[3] = ?");
        console.log(`expected output: (0,0)(1,1)(2,2)(3,3)(4,3)(5,3)(6,3)`);
        console.log(`received output: ${m2.expand(3).toString()}`);
    }
    if (
        m3.expand(7).toString() ===
        "(0,0)(1,1)(2,1)(3,0)(4,1)(5,1)(6,0)(7,1)(8,0)(9,1)(10,0)(11,1)(12,0)(13,1)(14,0)(15,1)(16,0)(17,1)(18,0)(19,1)(20,0)(21,1)"
    )
        console.log("✅ matrix expand test 3 passed");
    else {
        console.log("❌ matrix expand test 3 failed");
        console.log("(0,0)(1,1)(2,1)(3,0)(4,1)(5,1)(6,0)(7,1)(8,1)[7] = ?");
        console.log(
            `expected output: (0,0)(1,1)(2,1)(3,0)(4,1)(5,1)(6,0)(7,1)(8,0)(9,1)(10,0)(11,1)(12,0)(13,1)(14,0)(15,1)(16,0)(17,1)(18,0)(19,1)(20,0)(21,1)`,
        );
        console.log(`received output: ${m2.expand(3).toString()}`);
    }
    if (m4.expand(2).toString() === "(0,0)(1,1)(2,2)") console.log("✅ matrix expand test 4 passed");
    else {
        console.log("❌ matrix expand test 4 failed");
        console.log("(0,0,0)(1,1,1)[2] = ?");
        console.log(`expected output: (0,0)(1,1)(2,2)`);
        console.log(`received output: ${m2.expand(3).toString()}`);
    }

    // collapse
    let collapse = m1.collapse();
    if (collapse.newMatrix.toString() === "(0)(1)" && collapse.n == 9) console.log("✅ matrix collapse test 1 passed");
    else {
        console.log("❌ matrix collapse test 1 failed");
        console.log(`${m1.toString()} = ?`);
        console.log(`expected output: (0)(1)[9]`);
        console.log(`received output: ${collapse.newMatrix.toString()}[${collapse.n}]`);
    }

    collapse = m2.collapse();
    if (collapse.newMatrix.toString() === "(0,0,0)(1,1,1)" && collapse.n == 4)
        console.log("✅ matrix collapse test 2 passed");
    else {
        console.log("❌ matrix collapse test 2 failed");
        console.log(`${m2.toString()} = ?`);
        console.log(`expected output: (0,0,0)(1,1,1)[4]`);
        console.log(`received output: ${collapse.newMatrix.toString()}[${collapse.n}]`);
    }
    collapse = m3.collapse();
    if (collapse.newMatrix.toString() === "(0,0)(1,1)(2,1)(3,1)" && collapse.n == 2)
        console.log("✅ matrix collapse test 3 passed");
    else {
        console.log("❌ matrix collapse test 3 failed");
        console.log(`${m3.toString()} = ?`);
        console.log(`expected output: (0,0)(1,1)(2,1)(3,1)[2]`);
        console.log(`received output: ${collapse.newMatrix.toString()}[${collapse.n}]`);
    }
}
matrixTest();

function bashicuNumTest() {
    console.log("Testing BashicuNum class... (If no ❌s appear then its all good)");
    try {
        let one = new BashicuNumber(1);
        let big = new BashicuNumber(9e15);

        console.assert(one.matrix.toString() == "()", `❌ one.matrix is ${one.matrix.toString()} instead of ()`);
        console.assert(one.value === 1, `❌ one.value is ${one.value} instead of 1`);
        console.assert(
            big.matrix.toString() == "(0)(0)",
            `❌ big.matrix is ${one.matrix.toString()} instead of (0)(0)`,
        );

        let two = one.add(one);
        console.assert(two.matrix.toString() == "()", `❌ two.matrix is ${two.matrix.toString()} instead of ()`);
        console.assert(two.value == 2, `❌ two.value is ${two.value} instead of 2`);

        let ten = two.add(one).add(one).add(one).add(one).add(one).add(one).add(one).add(one);
        console.assert(ten.matrix.toString() == "(0)", `❌ ten.matrix is ${ten.matrix.toString()} instead of (0)`);
        console.assert(ten.value == 1, `❌ ten.value is ${ten.value} instead of 1`);

        let ten2 = new BashicuNumber(10);
        let ten3 = one.pow10();
        console.assert(ten.eq(ten2), `❌ ten != ten2`);
        console.assert(ten.eq(ten3), `❌ ten != ten3`);

        let tenten = ten.pow10().pow10().pow10().pow10().pow10().pow10().pow10().pow10().pow10();
        console.assert(
            tenten.matrix.toString() == "(0)(0)(0)(0)(0)(0)(0)(0)(0)(0)",
            `❌ tenten.matrix is ${tenten.matrix.toString()} instead of (0)(0)(0)(0)(0)(0)(0)(0)(0)(0)`,
        );
        console.assert(tenten.value == 1, `❌ tenten.value is ${tenten.value} instead of 1`);

        let tentenpow10 = tenten.pow10();
        console.assert(
            tentenpow10.matrix.toString() == "(0)(1)(0)",
            `❌ tentenpow10.matrix is ${tentenpow10.matrix.toString()} instead of (0)(1)(0)`,
        );
        console.assert(tentenpow10.value == 1, `❌ tentenpow10.value is ${tentenpow10.value} instead of 1`);

        console.log(tenten.toString());
        console.log(tentenpow10.toString());
        let tenten2 = tentenpow10.log10();
        console.log(tenten2.toString());
    } catch (e) {
        console.error(e);
    }
}
bashicuNumTest();
