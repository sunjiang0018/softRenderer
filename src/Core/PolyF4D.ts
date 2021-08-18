import POLY_STATE from "./enum/POLY_STATE";
import POLY_ATTR from "./enum/POLY_ATTR";
import Vector4 from "../Math/Vector/Vector4";

export default class PolyF4D {
    state = POLY_STATE.NONE
    attr = POLY_ATTR.NONE
    color = 0

    vlist = new Array<Vector4>(3)
    tvlist = new Array<Vector4>(3)

    next: PolyF4D | null = null
    prev: PolyF4D | null = null

}
