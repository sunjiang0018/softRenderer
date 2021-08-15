import Vector4 from "../Math/Vector/Vector4";
import ENUM_ATTR from "./ENUM_ATTR";
import ENUM_STATE from "./ENUM_STATE";

export default class Poly4D {

    state= ENUM_STATE.NONE
    attr = ENUM_ATTR.NONE
    color = 0

    vlist = new Array<Vector4>()
    vert = new Array<number>(3)
}
