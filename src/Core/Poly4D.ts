import Vector4 from "../Math/Vector/Vector4";
import POLY_ATTR from "./enum/POLY_ATTR";
import POLY_STATE from "./enum/POLY_STATE";

export default class Poly4D {

    state:POLY_STATE = POLY_STATE.NONE
    attr:number = POLY_ATTR.NONE
    color = 0

    vlist = new Array<Vector4>()
    vert = new Array<number>(3)
}
