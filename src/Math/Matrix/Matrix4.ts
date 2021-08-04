export default class Matrix4 {
    elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    constructor(n11: number, n12: number, n13: number, n14: number,
                n21: number, n22: number, n23: number, n24: number,
                n31: number, n32: number, n33: number, n34: number,
                n41: number, n42: number, n43: number, n44: number) {
        this.set(
            n11, n12, n13, n14,
            n21, n22, n23, n24,
            n31, n32, n33, n34,
            n41, n42, n43, n44)
    }

    set(n11: number, n12: number, n13: number, n14: number,
        n21: number, n22: number, n23: number, n24: number,
        n31: number, n32: number, n33: number, n34: number,
        n41: number, n42: number, n43: number, n44: number) {
        const n = this.elements;
        n[0] = n11;n[1] = n12;n[2] = n13;   n[3] = n14;
        n[4] = n21;n[5] = n22;n[6] = n23;   n[7] = n24;
        n[8] = n31;n[9] = n32;n[10] = n33;  n[11] = n34
        n[12] = n41;n[13] = n42;n[14] = n43;n[15] = n44;
    }
}
