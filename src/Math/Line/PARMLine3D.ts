import Vector3 from "../Vector/Vector3";

export default class PARMLine3D{
    p0:Vector3
    p1:Vector3
    v :Vector3

    constructor(p0:Vector3, p1:Vector3) {
        this.p0 = p0
        this.p1 = p1
        this.v = p1.subVector(p0)
    }
}
