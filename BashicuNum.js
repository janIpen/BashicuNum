export class Column {
    #array; // this.array - Int[]
    #height; // Int - normally when dealing with BMS matrices height is standardized across all columns, so it helps to have an explicit height
    constructor(array, height) {
        // we **do not presume anything**
        if (!Array.isArray(array)) throw new RangeError("Column input is not a valid column");
        if (array.length == 0) {
            this.#array = [0];
            this.#height = 1;
            return;
        }
        let last = Number.MAX_SAFE_INTEGER + 1;
        for (let e of array) {
            if (e < 0 || e > last || e % 1 != 0) throw new RangeError("Element ${e} of column is not a valid integer");
            last = e;
        }
        this.#array = array;
        if (height) this.#height = height;
        else this.#height = array.length || 1;
    }
    get height() {
        return this.#height;
    }
    // smallest height in which this column can fit into
    // (0) has minheight 0
    minHeight() {
        if (this.#array.indexOf(0) > -1) return this.#array.indexOf(0);
        return this.#array.length;
    }
    // I guess Matrix needs the column data
    get array() {
        return [...this.#array];
    }
    get length() {
        return this.array.length;
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
        if (rows && rows < this.minHeight())
            throw new RangeError(
                `toString(rows=${rows}) islesser than the number of non-zero rows in the column (${this.#array.join(",")})`,
            );
        if (!rows) rows = this.#array.length;
        let arr = [];
        for (let i = 0; i < rows; i++) {
            arr.push(this.#array[i] || 0);
        }
        return `(${arr.join(",")})`;
    }
}
// BMS matrix
export class Matrix {
    #columns; // this.columns - Column[] - Array of `Column`s
    #rows; // the number of rows this matrix has, e.g. PrSS = 1, PSS = 2, TSS = 3, etc...
    constructor(columns) {
        if (
            !Array.isArray(columns) &&
            (typeof columns !== "Number" || columns < 0 || columns > Number.MAX_SAFE_INTEGER || columns % 1 != 0)
        )
            throw new Error(`Matrix() constructor called with non-array input ${columns}`);

        // Allow to just put in an integer :3
        if (typeof columns === "Number") {
            this.#columns = Array.from({ length: columns }, () => new Column([0]));
            return;
        }

        // empty matrix
        if (columns.length == 0) {
            this.#columns = [];
            this.#rows = 1;
            return;
        }

        // if its an array of `Column`s already just throw it in
        if (columns[0] instanceof Column) {
            // ensure standardization of height
            const heights = columns.map((col) => col.minHeight());
            this.#rows = Math.max(...heights) || 1;
            this.#columns = columns.map((col) => new Column(col.array, this.#rows));
            return;
        }
        // remove trailing zeroes [0,0,0] -> [0]
        columns = columns.map((col) => {
            while (columns.length > 1 && columns[columns.length - 1] === 0) {
                col.pop();
            }
            return col;
        });
        const heights = columns.map((col) => col.length);

        let rows = Math.max(...heights);
        if (rows <= 0) rows = 1;
        this.#columns = columns.map((col) => new Column(col, rows));
        this.#rows = rows;
    }
    get rows() {
        return this.#rows;
    }

    // compares this matrix to another matrix
    // -1 if this < matrix
    // 0 if this == matrix
    // +1 if this > matrix
    cmp(matrix) {
        if (this.rows > matrix.rows) return 1;
        if (this.rows < matrix.rows) return -1;
        for (let i = 0; i < Math.min(this.#columns.length, matrix.#columns.length); i++) {
            // i optimised it for you :3
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

    // returns whether or not the current matrix is the zero matrix (true) or a larger matrix instead (false)
    isZero() {
        return (this.#columns.length == 0);
    }
    // returns whether or not the current matrix is a successor matrix (true) or a limit/zero matrix instead (false)
    isSuccessor() {
        if (this.isZero()) return false;
        const lastCol = this.#columns.at(-1);
        return lastCol.isZero();
    }
    // returns whether or not the current matrix is a limit matrix (true) or a successor/zero matrix instead (false)
    isLimit() {
        if (this.isZero()) return false;
        const lastCol = this.#columns.at(-1);
        return !lastCol.isZero();
    }

    // returns the closest limit matrix of the current matrix
    // e.g. (0)(0)(0)(0) -> (0)(1)[3]
    // e.g. (0)(1)(0)(1)(0)(1) -> (0)(1)(1)[2]
    // hopefully doesn't infinite loop but it shouldn't because BMS is well-ordered
    collapse() {
        const rows = this.#rows;
        let M = new Matrix([new Array(rows + 1).fill(0), new Array(rows + 1).fill(1)]);

        while (true) {
            let n = 1;
            while (M.expand(n).lt(this)) {
                n++;
                if (n == 1000) console.error("Something has probably gotten very wrong with Matrix.collapse()");
            }
            let expanded = M.expand(n);
            if (expanded.eq(this)) {
                return {
                    newMatrix: M,
                    n: n,
                };
            } else M = expanded;
        }
    }

    expand(n) {
        const l = this.#columns.length;
        
        // make the empty matrix expand to itself
        if (l == 0) {
            return new Matrix([]);
        }

        // if ends with (0) column, just pop it off
        if (this.isSuccessor()) {
            let newMatrix = [];
            this.#columns.forEach((c, i) => {
                if (i < l - 1) newMatrix.push(c);
            });
            return new Matrix(newMatrix);
        }

        // all the indices of columns to check
        let indices = Array.from({ length: l - 1 }, (_, index) => l - index - 2);
        for (let row = 0; row < this.rows; row++) {
            let last = this.#columns[l - 1].at(row);
            if (last == 0) break;
            indices = indices.filter((i) => {
                if (this.#columns[i].at(row) < last) {
                    last = this.#columns[i].at(row);
                    return true;
                }
            });
        }

        let badRootIndex = indices[0];

        let badRoot = this.#columns[badRootIndex];
        let lastColumn = this.#columns[this.#columns.length - 1];
        let ascensionMatrixArr = lastColumn.sub(badRoot).array;
        ascensionMatrixArr[ascensionMatrixArr.length - 1] = 0; // replace last entry with 0
        const ascensionMatrix = new Column(ascensionMatrixArr);

        let goodPart = this.#columns.slice(0, badRootIndex);
        let badPart = this.#columns.slice(badRootIndex, this.#columns.length - 1);

        // console.log("G:" + goodPart.map((c) => c.toString()).join(""));
        // console.log("B:" + badPart.map((c) => c.toString()).join(""));
        // console.log("Δ:" + ascensionMatrix.toString());

        let newMatrix = goodPart.concat(badPart);

        // add n bad roots
        for (let i = 0; i < n; i++) {
            badPart = badPart.map((column) => column.add(ascensionMatrix));
            newMatrix = newMatrix.concat(badPart);
        }

        return new Matrix(newMatrix);
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
const OMEGA_MATRIX = new Matrix([[0], [1]]);
const OMEGAPLUSONE_MATRIX = new Matrix([[0], [1], [0]]);

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
    #matrix;
    #value;
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
    // man you really need to be checking for n < 1 as well. idk how tho
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
        while (this.#value >= 10) {
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

    // accessors only here for testing purposes
    get matrix() {
        return this.#matrix;
    }
    get value() {
        return this.#value;
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
    mul(n) {
        // copy of add but with multiplication
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
        if (amatrix.gteq(THREE_MATRIX) || bmatrix.gteq(THREE_MATRIX)) {
            return a;
        }
        
        else if (amatrix.isZero() && bmatrix.isZero()) {
            let newValue = a.#value * b.#value;
            // if (newValue < 10)
            return new BashicuNumber([], newValue);
            // else return new BashicuNumber([[0]], Math.log(newValue));
        }
        
        else if (amatrix.eq(ONE_MATRIX) && bmatrix.isZero()) {
            let newValue = Math.pow(10, a.#value) * b.#value;
            return new BashicuNumber([], newValue);
        }
        
        else if (amatrix.eq(ONE_MATRIX) && bmatrix.eq(ONE_MATRIX)) {
            let newValue = Math.pow(10, a.#value + b.#value);
            return new BashicuNumber([], newValue);
        }
        
        else if (amatrix.eq(TWO_MATRIX) && bmatrix.isZero()) {
            let newValue = Math.pow(10, a.#value) + Math.log10(b.#value); // not the same so we aren't getting any 10^10^3 bullcrap
            return new BashicuNumber(ONE_MATRIX, newValue);
        }
        
        else if (amatrix.eq(TWO_MATRIX) && bmatrix.eq(ONE_MATRIX)) {
            let newValue = Math.pow(10, a.#value) + b.#value;
            return new BashicuNumber(ONE_MATRIX, newValue);
        }
        
        else if (amatrix.eq(TWO_MATRIX) && bmatrix.eq(TWO_MATRIX)) {
            let newValue = Math.pow(10, a.#value) + Math.pow(10, b.#value);
            return new BashicuNumber(ONE_MATRIX, newValue);
        }

        return "bruh"; // throw an error instead or something idk
    }
    pow10() {
        if this.#matrix.lt(OMEGA_MATRIX)
            return new BashicuNumber(this.#matrix.successor(), this.#value);
        else if this.#matrix.eq(OMEGA_MATRIX) // should never occur (?) but good to check
            return new BashicuNumber(this.#matrix, this.#value + 1);
        else if this.#matrix.eq(OMEGAPLUSONE_MATRIX)
            return new BashicuNumber(this.#matrix, Math.log10(10**this.#value + 1));
        else if this.#matrix.eq(new Matrix([[0], [1], [0], [0]]))
            return new BashicuNumber(this.#matrix, Math.log10(Math.log10(10**10**this.#value + 1)));
        // imprecision stopped this from mattering at (0)(1)(0)(0) 1.2 anyway
        else return new BashicuNumber(this.#matrix, this.#value);
    }
    log10() {
        // if empty matrix then just Math.log10
        if (this.#matrix.isZero()) return new BashicuNumber(ZERO_MATRIX, Math.log10(this.#value));
        // if matrix is finite nonzero just strip off a (0)
        if (this.#matrix.lt(OMEGA_MATRIX))
            return new BashicuNumber(this.#matrix.expand(1), this.#value) // just chop off a zero it doesnt matter what n you expand by
        // copy of pow10 from but with subtraction not addition
        else if this.#matrix.eq(OMEGA_MATRIX)
            return new BashicuNumber(this.#matrix, this.#value - 1);
        else if this.#matrix.eq(OMEGAPLUSONE_MATRIX)
            return new BashicuNumber(this.#matrix, Math.log10(10**this.#value - 1));
        else if this.#matrix.eq(new Matrix([[0], [1], [0], [0]]))
            return new BashicuNumber(this.#matrix, Math.log10(Math.log10(10**10**this.#value - 1)));
        else return new BashicuNumber(this.#matrix, this.#value);
    }
}
