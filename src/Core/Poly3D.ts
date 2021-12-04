import POLY_ATTR from "./enum/POLY_ATTR";
import POLY_STATE from "./enum/POLY_STATE";
import Vector3 from "../Math/Vector/Vector3";
import Vertex from "./Vertex";

export default class Poly3D {

    state = POLY_STATE.ACTIVE
    attr = POLY_ATTR.NONE
    color = new Vector3()
    litColor = new Array<Vector3>(3)

    texture: ImageData | null = null

    mati = 0                                       // -1表示没有材质

    vlist = new Array<Vertex>(3)       // 顶点坐标列表
    tlist = new Array<Vertex>(3)       // 纹理坐标列表
    vert = new Array<number>(3)         //指向纹理坐标列表的索引
    text = new Array<number>(3)

    nlength = 0                                      // 法线长度

    constructor() {
        for (let i = 0; i < 3; i++) {
            this.litColor[i] = new Vector3()
            this.vlist[i] = new Vertex()
            this.tlist[i] = new Vertex()
        }
    }
}
