import ENUM_STATE from "./ENUM_STATE";
import ENUM_ATTR from "./ENUM_ATTR";
import Vector4 from "../Math/Vector/Vector4";

export default class PolyF4D {
    state = ENUM_STATE.NONE
    attr = ENUM_ATTR.NONE
    color = 0

    vlist = new Array<Vector4>(3)
    tvlist = new Array<Vector4>(3)

    next: PolyF4D | null = null
    prev: PolyF4D | null = null

}
