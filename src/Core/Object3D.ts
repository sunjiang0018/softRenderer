import POLY_ATTR from "./enum/POLY_ATTR";
import Poly3D from "./Poly3D";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import Camera from "./Camera";
import Vector3 from "../Math/Vector/Vector3";
import CULL_OBJECT from "./enum/CULL_OBJECT";
import OBJECT_STATE from "./enum/OBJECT_STATE";
import POLY_STATE from "./enum/POLY_STATE";
import Vertex from "./Vertex";
import Vector2 from "../Math/Vector/Vector2";

let objectId = 0

export default class Object3D {
    id: number
    name: string = 'object3D'
    state = OBJECT_STATE.AVTIVE
    attr = POLY_ATTR.NONE

    mati = 0 //-1表示没有材质
    avgRadius = new Array<number>() //物体的平均半径，用于碰撞检测
    maxRadius = new Array<number>() //物体的最大半径

    worldPosition = new Vector3()
    dir = new Vector3()


    //局部坐标系中，用于存储物体的朝向。旋转期间将被自动更新
    ux = new Vector3()
    uy = new Vector3()
    uz = new Vector3()

    verticesNumber = 0  //物体的顶点数
    framesNumber = 0  // 帧数
    verticesTotal = 0 // 全部顶点
    frameCurrent = 0 //当前帧,如果只有一帧，则为0
    vListLocal = new Array<Vertex>()   //用于存储顶点局部坐标的数组
    vListTrans = new Array<Vertex>()   //存储变换后的顶点坐标的数组

    vListLocalIndex = 0
    vListTransIndex = 0

    tList = new Array<Vector2>();

    texture: ImageData | null = null


    polysNum = 0        //物体网格的多边形数
    plist = new Array<Poly3D>()     //多边形数组

    constructor() {
        this.id = objectId++
    }

    setFrame(frame: number) {
        this.frameCurrent = frame
    }

    public transform(mt: Matrix4, coordSelect: TRANSFORM_TYPE, isTransformBasis = true) {
        for (let vertxIndex = 0; vertxIndex < this.verticesNumber; vertxIndex++) {
            switch (coordSelect) {
                case TRANSFORM_TYPE.LOCAL_ONLY:
                    this.vListLocal[vertxIndex].v.applyMatrix4(mt)
                    break;
                case TRANSFORM_TYPE.TRANS_ONLY:
                    this.vListTrans[vertxIndex].v.applyMatrix4(mt)
                    break;
                case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                    const result = this.vListLocal[vertxIndex].v.clone();
                    result.applyMatrix4(mt)
                    this.vListTrans[vertxIndex].v.copy(result)
            }
        }

        if (isTransformBasis) {
            this.ux.applyMatrix4(mt)
            this.uy.applyMatrix4(mt)
            this.uz.applyMatrix4(mt)
        }

    }

    public modelToWorld(coordSelect: TRANSFORM_TYPE) {
        for (let i = 0; i < this.verticesNumber; i++) {

            switch (coordSelect) {
                case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                    this.vListTrans[i].v.addVectors(this.vListLocal[i].v, this.worldPosition)
                    break;
                case TRANSFORM_TYPE.TRANS_ONLY:
                    this.vListTrans[i].v.add(this.worldPosition)
            }

        }
    }

    public worldToCamera(camera: Camera) {
        for (let i = 0; i < this.verticesNumber; i++) {
            this.vListTrans[i].v.applyMatrix4(camera.mcam)
        }
    }

    public cullObject(camera: Camera, cullFlags: CULL_OBJECT): boolean {
        const spherePosition = this.worldPosition.clone()

        spherePosition.applyMatrix4(camera.mcam);

        if (cullFlags & CULL_OBJECT.Z_PLANE) {
            if (((spherePosition.z - this.maxRadius[0]) > camera.farFilpZ) ||
                ((spherePosition.z + this.maxRadius[0]) < camera.nearFilpZ)) {
                this.state |= OBJECT_STATE.CULLED
                return true
            }
        }

        if (cullFlags & CULL_OBJECT.X_PLANE) {
            const zTest = 0.5 * (camera.viewPlaneWidth * spherePosition.z / camera.viewDist);
            if (((spherePosition.x - this.maxRadius[0]) > zTest) ||
                ((spherePosition.x + this.maxRadius[0]) < -zTest)) {
                this.state |= OBJECT_STATE.CULLED
                return true
            }
        }

        if (cullFlags & CULL_OBJECT.Y_PLANE) {
            const zTest = 0.5 * (camera.viewportHeight * spherePosition.z / camera.viewDist);
            if (((spherePosition.y - this.maxRadius[0]) > zTest) ||
                ((spherePosition.y + this.maxRadius[0]) < -zTest)) {
                this.state |= OBJECT_STATE.CULLED
                return true
            }
        }

        return false
    }

    public reset() {
        this.state &= ~OBJECT_STATE.CULLED;

        for (let i = 0; i < this.polysNum; i++) {

            const current = this.plist[i];

            if (!(current.state & POLY_STATE.ACTIVE)) continue;

            current.state &= ~POLY_STATE.CLIPPED;
            current.state &= ~POLY_STATE.BACKFACE;

        }
    }

    public removeBackFaces(camera: Camera) {

        if (this.state & OBJECT_STATE.CULLED) return;

        for (let i = 0; i < this.polysNum; i++) {
            const current = this.plist[i];
            if (!(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE) ||
                (current.attr & POLY_ATTR.DOUBLE_SIDE)) continue;

            const vIndex0 = current.vert[0];
            const vIndex1 = current.vert[1];
            const vIndex2 = current.vert[2];

            const u = new Vector3(), v = new Vector3(), n = new Vector3();

            u.subVectors(this.vListTrans[vIndex1].v, this.vListTrans[vIndex0].v);
            v.subVectors(this.vListTrans[vIndex2].v, this.vListTrans[vIndex0].v);

            n.crossVectors(u, v);

            const view = new Vector3();

            view.subVectors(camera.position, this.vListTrans[vIndex0].v);

            const dp = n.dot(view);

            if (dp <= 0) {
                current.state |= POLY_STATE.BACKFACE
            }

        }
    }
}
