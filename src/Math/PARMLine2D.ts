import Vector2 from "./Vector2";

export default class PARMLine2D {
    p0: Vector2
    p1: Vector2
    v: Vector2

    constructor(p0:Vector2, p1:Vector2) {
        this.p0 = p0
        this.p1 = p1

        this.v = p1.subVector(p0)
    }


}
