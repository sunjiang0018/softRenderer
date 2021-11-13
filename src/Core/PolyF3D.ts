import POLY_STATE from "./enum/POLY_STATE";
import POLY_ATTR from "./enum/POLY_ATTR";
import Vector3 from "../Math/Vector/Vector3";

export default class PolyF3D {
    state = POLY_STATE.ACTIVE
    attr = POLY_ATTR.NONE
    color = new Vector3()

    vlist = new Array<Vector3>()
    tvlist = new Array<Vector3>()

    next: PolyF3D | null = null
    prev: PolyF3D | null = null

    constructor() {
        for (let i = 0; i < 3; i++) {
            this.vlist.push(new Vector3())
            this.tvlist.push(new Vector3())
        }
    }

    clone() {
        const result = new PolyF3D()

        result.state = this.state
        result.attr = this.attr
        result.color = this.color

        result.next = this.next
        result.prev = this.prev

        for (let i = 0; i < 3; i++) {
            result.vlist[i].copy(this.vlist[i])
            result.tvlist[i].copy(this.tvlist[i])
        }

        return result
    }

    copy(polyf3d: PolyF3D) {
        this.state = polyf3d.state
        this.attr = polyf3d.attr
        this.color = polyf3d.color

        this.next = polyf3d.next
        this.prev = polyf3d.prev

        for (let i = 0; i < 3; i++) {
            this.vlist[i].copy(polyf3d.vlist[i])
            this.tvlist[i].copy(polyf3d.tvlist[i])
        }

    }

}
