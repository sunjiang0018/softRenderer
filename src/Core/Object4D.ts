import ENUM_STATE from "./ENUM_STATE";
import ENUM_ATTR from "./ENUM_ATTR";
import Vector4 from "../Math/Vector/Vector4";
import Poly4D from "./Poly4D";

let objectId = 0

export default class Object4D {
    id: number
    name: string = 'object4D'
    state = ENUM_STATE.NONE
    attr = ENUM_ATTR.NONE

    avgRadius = 0 //物体的平均半径，用于碰撞检测
    maxRadius= 0 //物体的最大半径

    worldPosition = new Vector4()
    dir= new Vector4()


    //局部坐标系中，用于存储物体的朝向。旋转期间将被自动更新
    ux = new Vector4()
    uy = new Vector4()
    uz = new Vector4()

    verticesNumber = 0  //物体的顶点数
    vlistLocal = new Array<Vector4>()   //用于存储顶点局部坐标的数组
    vlistTrans = new Array<Vector4>()   //存储变换后的顶点坐标的数组

    polysNum = 0        //物体网格的多边形数
    plist = new Array<Poly4D>()     //多边形数组


    constructor() {
        this.id = objectId++
    }
}
