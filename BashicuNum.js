// don't export internal classes
// I'd make it a class inside of Matrix if it was possible
class Column {
    // this.array - Int[]
    // this.length - "canonical" length of the column
    constructor(array) {
        // we **do not presume anything**
        if (!Array.isArray(array))
            throw new RangeError("Column input is not a valid column");
        if (array.length == 0) {
            this.#array = [0];
            return;
        }
        let last = Number.MAX_SAFE_INTEGER + 1;
        for (let e of array) {
            if (e < 0|| e > last || e % 1 != 0)
                throw new RangeError("Element ${e} of column is not a valid integer");
            last = e;
        }
        // private properties, public methods
        this.#array = array;
    }
    // store as little as needed
    get height() {
        if (this.#array.indexof(0) > -1) return this.#array.indexof(0);
        return this.#array.length;
    }
    // I guess Matrix needs the column data
    get array() {
        return [...this.#array];
    }
    at(index) {
        return this.#array[index] || 0;
    }

    // compares this column to another column
    // -1 if this < col
    // 0 if this == col
    // +1 if this > col
    cmp(col) {
        for (let i = 0; i < Math.min(this.height, col.height); i++) {
            if (this.at(i) > col.at(i)) return 1;
            if (this.at(i) < col.at(i)) return -1;
        }
        if (this.height > col.height) return 1;
        if (this.height < col.height) return -1;
        return 0;
    }
    lt(col) {
        return this.cmp(col) == -1;
    }
    gt(col) {
        return this.cmp(col) == 1;
    }
    eq(col) {
        return this.cmp(col) == 0;
    }
    lteq(col) {
        return this.cmp(col) < 1;
    }
    gteq(col) {
        return this.cmp(col) > -1;
    }

    isZero() {
        for (let i = 0; i < this.height; i++) {
            if (this.#array[i] != 0) return false;
        }
        return true;
    }

    add(col) {
        let result = [];
        for (let i = 0; i < Math.max(this.height, col.height); i++) {
            result.push(this.at(i) + col.at(i));
        }
        return new Column(result);
    }
    sub(col) {
        let result = [];
        for (let i = 0; i < Math.max(this.height, col.height); i++) {
            result.push(this.at(i) - col.at(i));
        }
        return new Column(result);
    }

    addScalar(n) {
        let result = [];
        for (let i = 0; i < this.height; i++) {
            result[i] = this.#array[i] + n;
        }
        return new Column(result);
    }

    push(element) {
        this.#array.push(element);
    }
    toString(rows) {
        if (rows && rows < this.height)
            throw new RangeError(
                `toString(rows=${rows}) islesser than the number of non-zero rows in the column (${this.#array.join(",")})`,
            );
        // improve this so we aren't setting internal data
        let output = `(${this.#array.join(",")}`;
        output += ',0'.repeat((rows - this.height) || 0);
        return output + ')';
    }
}
// BMS matrix
class Matrix {
    // this.columns - Column[] - Array of `Column`s
    // this.rows - the number of rows this matrix has, e.g. PrSS = 1, PSS = 2, TSS = 3, etc...
    constructor(columns) {
        if (!Array.isArray(columns) && (typeof(columns) !== "Number" || columns < 0 || columns > Number.MAX_SAFE_INTEGER || columns % 1 != 0))
            throw new Error(`Matrix() constructor called with non-array input ${columns}`);

        // Allow to just put in an integer :3
        if (typeof(columns) === "Number") {
            this.#columns = Array.from({length: columns}, () => new Column([0]));
            return;
        }
        // if its an array of `Column`s already just throw it in
        if (columns[0] instanceof Column) {
            this.#columns = columns;
            return;
        }
        // remove trailing zeroes [0,0,0] -> [0]
        columns = columns.map((col) => {
            while (columns.length > 1 && columns[columns.length - 1] === 0) {
                col.pop();
            }
            return col;
        });
        this.#columns = columns.map((col) => new Column(col));
    }
    get rows() {
        return Math.max(this.#columns.map(col => col.height));
    }

    // compares this matrix to another matrix
    // -1 if this < matrix
    // 0 if this == matrix
    // +1 if this > matrix
    cmp(matrix) {
        if (this.rows > matrix.rows) return 1;
        if (this.rows < matrix.rows) return -1;
        // if (this.eq(matrix)) return false;
        for (let i = 0; i < Math.min(this.#columns.length, matrix.#columns.length); i++) {
            // potentially optimizable? by calling the underlying cmp() once only
            let cmp = this.#columns[i].cmp(matrix.#columns[i]);
            if (cmp !== 0) return cmp;
        }
        if (this.#columns.length > matrix.#columns.length) return 1;
        if (this.#columns.length < matrix.#columns.length) return -1;
        return 0;
    }
    lt(matrix) {
        return this.cmp(matrix) == -1;
    }
    gt(matrix) {
        return this.cmp(matrix) == 1;
    }
    eq(matrix) {
        return this.cmp(matrix) == 0;
    }
    lteq(matrix) {
        return this.cmp(matrix) < 1;
    }
    gteq(matrix) {
        return this.cmp(matrix) > -1;
    }

    // returns the successor matrix of the current matrix
    successor() {
        const newCol = new Column(new Array(this.rows).fill(0));
        const newCols = this.#columns.concat([newCol]);
        return new Matrix(newCols);
    }

    // returns whether or not the current matrix is a successor matrix (true) or a limit matrix instead (false)
    isSuccessor() {
        const lastCol = this.columns[this.columns.length - 1];
        return lastCol.isZero();
    }

    // returns the closest limit matrix of the current matrix
    // e.g. (0)(0)(0)(0) -> (0)(1)[3]
    // e.g. (0)(1)(0)(1)(0)(1) -> (0)(1)(1)[2]
    // if not returns undefined
    collapse() {
        const l = this.#columns.length;
        const maxPatternLength = Math.floor(l / 2);
        for (let patternLength = 1; patternLength <= maxPatternLength; patternLength++) {
            const block1 = this.#columns.slice(l - patternLength, l);

            // assert that all elements in the block1 must be greater than the first element in block1 to be a valid block
            // prevents collapsing things like (0),(1)(0),(1)(0),(1)(0),(1)(0),(1)(0)
            const suspectedBadRoot = block1[0]; // suspected bad root, even if a patter is found may not be the actual bad root due to ascension
            let validBlock = true;
            for (let i = 1; i < patternLength; i++) {
                if (suspectedBadRoot.gt(block1[i])) {
                    validBlock = false;
                    break;
                }
            }
            if (!validBlock) continue;

            // compares two Column[]s, and see if they are a constant offset apart
            // for single-length Columns it is guaranteed to be constant, but:
            // e.g. (0,0)(1,1)(2,1)(3,0)'(1,0)(2,1)(3,1)(4,0) has a constant offset of (1,0)
            // e.g. (0,0)(1,1)(2,1)(3,0)'(1,0)(2,1)(3,1)(4,1) does not have a constant offset
            function isValidAscension(block1, block2, ascensionMatrix) {
                if (block1.height != block2.height) return false; // bruh, maybe even error lowkey
                if (!ascensionMatrix) ascensionMatrix = block1[0].sub(block2[0]);
                for (let i = 1; i < block1.height; i++) {
                    if (!block1[i].sub(block2[i]).eq(ascensionMatrix)) return false;
                }
                return true;
            }

            // checks blocks of length `patternLength` from the back to see if it fits expected pattern
            const block2 = this.columns.slice(l - patternLength * 2, l - patternLength);
            if (!isValidAscension(block1, block2)) return false; // otherwise, we have at least 2 blocks that satisfy so we just search for more

            let ascensionMatrix = block1[0].sub(block2[0]);
            // cant have any negative values:
            const negativeValues = ascensionMatrix.array.find((x) => x < 0);
            if (negativeValues) continue;

            let blocksFound = 2;
            let prevBlock = block2;
            for (let i = 2; i < Math.floor(l / patternLength); i++) {
                const currBlock = this.#columns.slice(l - patternLength * (i + 1), l - patternLength * i);
                if (!isValidAscension(prevBlock, currBlock, ascensionMatrix)) break;
                blocksFound++;
            }

            // a pattern is found
            let indexOfBadRoot = l - patternLength * blocksFound;
            let badRoot = this.columns[indexOfBadRoot];

            // TODO: stress test ascension with various bms matrices
            if (ascensionMatrix.at(ascensionMatrix.length - 1) == 0) ascensionMatrix = ascensionMatrix.addScalar(1);
            else if (ascensionMatrix.at(ascensionMatrix.length - 1) != 0) {
                let array = ascensionMatrix.array;
                while (array.at(-1) == 0) array.pop();
                array.push(1);
                ascensionMatrix = new Column(array);
            }
            let expander = badRoot.add(ascensionMatrix);
            let newMatrix = new Matrix(this.#columns.slice(0, l - patternLength * (blocksFound - 1)).concat([expander]));
            return {
                newMatrix: newMatrix,
                n: blocksFound - 1, // change depending on expansion rules
            };
        }
    }

    expand(n) {
        // TODO (unused)
    }

    toString() {
        if (this.#columns.length == 0) return "()";
        return this.#columns.map((col) => col.toString(this.rows)).join("");
    }
}

const ZERO_MATRIX = new Matrix([]);
const ONE_MATRIX = new Matrix([[0]]);
const TWO_MATRIX = new Matrix([[0], [0]]);
const THREE_MATRIX = new Matrix([[0], [0], [0]]);

// stores numbers as matrix - value pairs:
// () x = x
// (0) x = 10^x
// (0)(0) x = 10^10^x
// where 1 <= x < 10
// For limit expressions, we have:
// (0)(1) x+y = (0)(1)[x] 10^y where x is the integer part and y is the decimal part and 1<=x+y<10
// maybe in another world it would be (0)(1)[10^x] 10^y but I dont want to deal with having to deal with matrices of length 10^9+
//
// the system is set up in a way that all normalized BashicuNumber matrices are successor matrices rather than limit matrices (I think)
export class BashicuNumber {
    constructor(arg1, arg2) {
        if (typeof arg1 == "number") {
            if (arg1 > Number.MAX_SAFE_INTEGER) {
                throw new Error(`BashicuNumber() cannot accept numbers above ${Number.MAX_SAFE_INTEGER}`);
            }

            this.#matrix = new Matrix([]);
            this.#value = arg1;
            this.normalize();
            return;
        }
        if (typeof arg2 != "number") return; // error?
        if (typeof arg2 == "number") {
            if (arg2 > Number.MAX_SAFE_INTEGER) {
                throw new Error(`BashicuNumber() cannot accept numbers above ${Number.MAX_SAFE_INTEGER}`);
            }

            let matrix;
            if (Array.isArray(arg1)) {
                matrix = new Matrix(arg1);
            } else if (arg1 instanceof Matrix) {
                matrix = arg1;
            } else return; // error?

            this.#matrix = matrix;
            this.#value = arg2;

            this.normalize();
        }
    }

    // hopefully this doesnt become an infinite loop
    normalizeMatrix() {
        const result = this.#matrix.collapse();
        if (!result) return;
        const { newMatrix, n } = result;
        if (n >= 10) {
            this.#matrix = newMatrix;
            this.#value = n + Math.log10(this.#value);
            this.normalize();
        }
    }
    normalize() {
        while (this.value >= 10) {
            this.#value = Math.log10(this.#value);
            this.#matrix = this.#matrix.successor();
        }
        this.normalizeMatrix();
    }

    toString() {
        return `BashicuNumber { matrix: ${this.#matrix.toString()}, value: ${this.#value} }`;
    }

    // compares this matrix to another BashicuNumber n
    // -1 if this < n
    // 0 if this == n
    // +1 if this > n
    cmp(n) {
        if (this.#matrix.lt(n.#matrix)) return -1;
        if (this.#matrix.gt(n.#matrix)) return 1;
        if (this.#value < n.#value) return -1;
        if (this.#value > n.#value) return 1;
        return 0; // equal
    }
    lt(n) {
        return this.cmp(n) == -1;
    }
    gt(n) {
        return this.cmp(n) == 1;
    }
    eq(n) {
        return this.cmp(n) == 0;
    }
    lteq(n) {
        return this.cmp(n) < 1;
    }
    gteq(n) {
        return this.cmp(n) > -1;
    }

    add(n) {
        let a, b; // a > b
        if (this.lt(n)) {
            a = n;
            b = this;
        } else {
            a = this;
            b = n;
        }

        let amatrix = a.#matrix;
        let bmatrix = b.#matrix;

        // past this point just take the bigger number
        if (amatrix.gteq(TWO_MATRIX) || bmatrix.gteq(TWO_MATRIX)) {
            return a;
        }

        if (amatrix.eq(ZERO_MATRIX) && bmatrix.eq(ZERO_MATRIX)) {
            let newValue = a.#value + b.#value;
            // if (newValue < 10)
            return new BashicuNumber([], newValue);
            // else return new BashicuNumber([[0]], Math.log(newValue));
        }

        if (amatrix.eq(ONE_MATRIX) && bmatrix.eq(ZERO_MATRIX)) {
            let newValue = Math.pow(10, a.#value) + b.#value;
            return new BashicuNumber([], newValue);
        }

        if (amatrix.eq(ONE_MATRIX) && bmatrix.eq(ONE_MATRIX)) {
            let newValue = Math.pow(10, a.#value) + Math.pow(10, b.#value);
            return new BashicuNumber([], newValue);
        }

        return "bruh"; // throw an error instead or something idk
    }
    pow10() {
        return new BashicuNumber(this.#matrix.successor(), this.#value);
    }
    log10() {
        // if empty matrix then just Math.log10
        // if matrix is successor (which it should be) just strip off the (0), then:
        // if resulting matrix is a limit matrix, expand the limit matrix accordingly
        // which needs expand() to be coded out first
    }
}
