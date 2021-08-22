import POLY_STATE from "./enum/POLY_STATE";
import POLY_ATTR from "./enum/POLY_ATTR";
import Vector4 from "../Math/Vector/Vector4";
import Poly4D from "./Poly4D";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import Camera from "./Camera";

let objectId = 0

export default class Object4D {
    id: number
    name: string = 'object4D'
    state = POLY_STATE.NONE
    attr = POLY_ATTR.NONE

    avgRadius = 0 //物体的平均半径，用于碰撞检测
    maxRadius = 0 //物体的最大半径

    worldPosition = new Vector4()
    dir = new Vector4()


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

    transform(mt: Matrix4, coordSelect: TRANSFORM_TYPE, isTransformBasis = true) {
        for (let vertxIndex = 0; vertxIndex < this.verticesNumber; vertxIndex++) {
            switch (coordSelect) {
                case TRANSFORM_TYPE.LOCAL_ONLY:
                    this.vlistLocal[vertxIndex].applyMatrix4(mt)
                    break;
                case TRANSFORM_TYPE.TRANS_ONLY:
                    this.vlistTrans[vertxIndex].applyMatrix4(mt)
                    break;
                case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                    const result = this.vlistLocal[vertxIndex].clone();
                    result.applyMatrix4(mt)
                    this.vlistTrans[vertxIndex].copy(result)
            }
        }

        if (isTransformBasis) {
            this.ux.applyMatrix4(mt)
            this.uy.applyMatrix4(mt)
            this.uz.applyMatrix4(mt)
        }

    }

    worldToCamera(camera: Camera) {
        for (let i = 0; i < this.verticesNumber; i++) {
            this.vlistTrans[i].applyMatrix4(camera.mcam)
        }
    }
}
