export default class Matrix2 {
    elements = [
        1, 0,
        0, 1
    ]

    constructor(n11: number, n12: number, n21: number, n22: number) {
        this.set(n11, n12, n21, n22)
    }

    set(n11: number, n12: number, n21: number, n22: number) {
        const n = this.elements
        n[0] = n11
        n[1] = n12
        n[2] = n21
        n[3] = n22
    }
}
