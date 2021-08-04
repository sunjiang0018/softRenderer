export default class Matrix3 {
    elements = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]

    constructor(n11: number, n12: number, n13: number,
                n21: number, n22: number, n23: number,
                n31: number, n32: number, n33: number) {
        this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33)
    }

    set(n11: number, n12: number, n13: number,
        n21: number, n22: number, n23: number,
        n31: number, n32: number, n33: number) {
        const n = this.elements
        n[0] = n11;n[1] = n12;n[2] = n13;
        n[3] = n21;n[4] = n22;n[5] = n23;
        n[6] = n31;n[7] = n32;n[8] = n33;
    }
}
