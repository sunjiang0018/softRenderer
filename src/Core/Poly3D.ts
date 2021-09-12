import POLY_ATTR from "./enum/POLY_ATTR";
import POLY_STATE from "./enum/POLY_STATE";
import Vector3 from "../Math/Vector/Vector3";

export default class Poly3D {

    state: POLY_STATE = POLY_STATE.ACTIVE
    attr: POLY_ATTR = POLY_ATTR.NONE
    color = 0

    vlist = new Array<Vector3>()
    vert = new Array<number>(3)
}
