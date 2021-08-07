import Matrix3 from "./Matrix3";

export default class Matrix2 {
    elements = [
        1, 0,
        0, 1
    ]

    constructor(n11: number = 0, n12: number = 0, n21: number = 0, n22: number = 0) {
        this.set(n11, n12, n21, n22)
    }

    set(n11: number, n12: number, n21: number, n22: number) {
        const n = this.elements
        n[0] = n11
        n[1] = n12
        n[2] = n21
        n[3] = n22
        return this
    }


    identity() {

        this.set(
            1, 0,
            0, 1,
        );

        return this;

    }

    copy(m: Matrix2) {

        const te = this.elements;
        const me = m.elements;

        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        return this;

    }

    setFromMatrix3(m: Matrix3) {

        const me = m.elements;

        this.set(
            me[0], me[4],
            me[1], me[5]
        );

        return this;

    }

    add(m:Matrix2){
        const te = this.elements
        const me = m.elements

        te[0] +=me[0]
        te[1] +=me[1]
        te[2] +=me[2]
        te[3] +=me[3]

        return this
    }

    multiply(m: Matrix2) {

        return this.multiplyMatrices(this, m);

    }

    premultiply(m: Matrix2) {

        return this.multiplyMatrices(m, this);

    }

    multiplyMatrices(a: Matrix2, b: Matrix2) {

        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[3];
        const a21 = ae[1], a22 = ae[4];

        const b11 = be[0], b12 = be[3];
        const b21 = be[1], b22 = be[4];

        te[0] = a11 * b11 + a12 * b21
        te[2] = a11 * b12 + a12 * b22

        te[1] = a21 * b11 + a22 * b21
        te[3] = a21 * b12 + a22 * b22

        return this;

    }

    multiplyScalar(s: number) {

        const te = this.elements;

        te[0] *= s;
        te[1] *= s;
        te[2] *= s;
        te[3] *= s;

        return this;
    }

    eterminant() {

        const te = this.elements;

        const a = te[0], b = te[2],
            c = te[1], d = te[3]

        return a * d - b * c;

    }

    invert() {
        const te = this.elements
        const a = te[0], b = te[2],
            c = te[1], d = te[3],

            det = a * d - b * c;

        if(det === 0) return this.set(0,0,0,0)

        const detInv = 1 / det;

        te[0] = d * detInv;
        te[2] = -b * detInv;
        te[1] = -c * detInv;
        te[3] = a * detInv;

        return this;

    }

    transpose(){
        let tmp;
        const m = this.elements;

        tmp = m[1];
        m[1] = m[2];
        m[2] = tmp;
        return this;
    }

    scale(sx:number, sy:number) {

        const te = this.elements;

        te[0] *= sx;
        te[2] *= sx;
        te[1] *= sy;
        te[3] *= sy;

        return this;

    }


    rotate(theta:number) {

        const c = Math.cos(theta);
        const s = Math.sin(theta);

        const te = this.elements;

        const a11 = te[0], a12 = te[2];
        const a21 = te[1], a22 = te[3];

        te[0] = c * a11 + s * a21;
        te[2] = c * a12 + s * a22;

        te[1] = -s * a11 + c * a21;
        te[3] = -s * a12 + c * a22;

        return this;

    }

    equals(matrix:Matrix2) {

        const te = this.elements;
        const me = matrix.elements;

        for (let i = 0; i < 4; i++) {

            if (te[i] !== me[i]) return false;

        }

        return true;

    }

    fromArray(array:number[], offset = 0) {

        for (let i = 0; i < 4; i++) {

            this.elements[i] = array[i + offset];

        }

        return this;

    }

    toArray(array:number[] = [], offset = 0) {

        const te = this.elements;

        array[offset] = te[0];
        array[offset + 1] = te[1];

        array[offset + 2] = te[2];
        array[offset + 3] = te[3];

        return array;

    }

    clone() {
        return new Matrix2().fromArray(this.elements);
    }

}
