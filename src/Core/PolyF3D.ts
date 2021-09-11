import POLY_STATE from "./enum/POLY_STATE";
import POLY_ATTR from "./enum/POLY_ATTR";
import Vector3 from "../Math/Vector/Vector3";

export default class PolyF3D {
    state = POLY_STATE.NONE
    attr = POLY_ATTR.NONE
    color = 0

    vlist = new Array<Vector3>(3)
    tvlist = new Array<Vector3>(3)

    next: PolyF3D | null = null
    prev: PolyF3D | null = null

}
