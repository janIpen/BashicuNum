const BASE = 10;
const MAX_ROWS = 10; // can be a lot higher

export class Column {
    constructor(array) {
        // we presume they will be arrays of integers, with no trailing 0s,
        this.array = array;
        this.length = this.array.length;
    }
    at(index) {
        return this.array[index] || 0;
    }
    eq(col) {
        for (let i = 0; i < Math.max(this.length, col.length); i++) {
            if (this.at(i) != col.at(i)) return false;
        }
        return true;
    }
    lt(col) {
        for (let i = 0; i < Math.max(this.length, col.length); i++) {
            if (this.at(i) > col.at(i)) return false;
        }
        if (this.eq(col)) return false;
        return true;
    }
    gt(col) {
        return col.lt(this);
    }
    add(col) {
        let result = [];
        for (let i = 0; i < Math.max(this.length, col.length); i++) {
            result.push(this.at(i) + col.at(i));
        }
        return result;
    }
    sub(col) {
        let result = [];
        for (let i = 0; i < Math.max(this.length, col.length); i++) {
            result.push(this.at(i) - col.at(i));
        }
        return result;
    }
    toString() {
        return `(${this.array.join(",")})`;
    }
}

export class Matrix {
    constructor(columns) {
        if (!Array.isArray(columns)) throw new Error(`Matrix() constructor called with non-array input ${columns}`);
        // remove trailing zeroes [0,0,0] -> [0]
        columns = columns.map((col) => {
            while (columns.length > 1 && columns[columns.length - 1] === 0) {
                col.pop();
            }
            return col;
        });
        let lengths = columns.map((col) => col.length); // todo: chop off zeroes
        this.rows = Math.max(...lengths);
        if (Array.isArray(input)) this.columns = columns.map((col) => new Column(col));
    }

    toString() {
        return this.columns.reduce((accumulator, currentColumn) => {
            return accumulator + `(${currentColumn.join(",")})`;
        }, "");
    }

    eq(matrix) {
        return this.toString() == matrix.toString();
    }

    gt(matrix) {
        return this.toString() > matrix.toString();
    }

    lt(matrix) {
        return this.toString() < matrix.toString();
    }

    add(matrix) {
        let newMatrix;
        if (this.toString() >= matrix.toString()) {
            newMatrix = new Matrix(this.columns.concat(matrix.columns));
        } else {
            newMatrix = new Matrix(matrix.columns.concat(this.columns));
        }

        return this.collapse(newMatrix);
    }

    collapse(matrix) {
        let cols = matrix.columns;
        let length = cols.length;
        if (length < BASE) return matrix;

        let maxPatternSizeToCheck = Math.floor(length / BASE);

        // 0000 patternlength = 1, BASE = 3 0(*0)00, *0 should be the last 0 checked at index 1 so length-base*patternLength = 4-3*1 = 1
        for (let patternLength = 1; patternLength <= maxPatternSizeToCheck; patternLength++) {
            for (let i = 0; i <= length - BASE * patternLength; i++) {
                let firstBlock = matrix.columns.slice(i, i + patternLength);

                let firstCol = firstBlock[0];
                let sus = firstBlock.find((col) => arrLt(col, firstCol));
                if (sus) continue; // prevents blocks like (1)(0) from being treated as patterns

                let nextBlock = matrix.columns.slice(i + patternLength, i + patternLength * 2);

                // TODO: check for ascension difference
                // for now we ignore ascension
                function arrsEq(arrs1, arrs2) {
                    if (arrs1.length != arrs2.length) return false;
                    for (let i = 0; i < arrs1.length; i++) {
                        if (!arrEq(arrs1[i], arrs2[i])) return false;
                    }
                    return true;
                }
                // arr1 < arr2 : true
                // arr1 >= arr2: false
                function arrLt(arr1, arr2) {
                    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
                        if ((arr1[i] || 0) > (arr2[i] || 0)) return false;
                    }
                    if (arrEq(arr1, arr2)) return false;
                    return true;
                }
                function arrGt(arr1, arr2) {
                    return arrLt(arr2, arr1);
                }
                function arrEq(arr1, arr2) {
                    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
                        if ((arr1[i] || 0) != (arr2[i] || 0)) return false;
                    }
                    return true;
                }
                // function arrAdd(arr1, arr2) {
                //     let result = [];
                //     for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
                //         result.push(arr1[i] || 0 + arr2[i] || 0);
                //     }
                //     return result;
                // }
                // function arrSubtract(arr1, arr2) {
                //     let result = [];
                //     for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
                //         result.push(arr1[i] || 0 - arr2[i] || 0);
                //     }
                //     return result;
                // }

                // let suspectedAscensionMatrix = arrSubtract(nextBlock - firstBlock);

                // for now we ignore ascension, so if it doesnt repeat BASE times, instant fail
                let patternHold = true;
                for (let j = 1; j < BASE; j++) {
                    let index = i + patternLength * j;
                    if (!arrsEq(firstBlock, cols.slice(index, index + patternLength))) {
                        patternHold = false;
                        break;
                    }
                }
                if (!patternHold) continue; // search again starting at a different index

                // now that we have found BASE identical blocks, remove them and add expander
                // e.g. (0)(0)(0)(0)(0)(0)(0)(0)(0)(0) = (0)(1), (1) is the "expander" here
                let expander = [firstBlock[0][0] + 1];
                cols.splice(i + patternLength, (BASE - 1) * patternLength, expander);
                length = cols.length;
                break; // pattern found, stop searching for patterns <= current patternLength
            }
        }
        return new Matrix(cols);
    }

    value() {}
}
