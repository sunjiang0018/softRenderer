import PolyF3D from "./PolyF3D";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import POLY_STATE from "./enum/POLY_STATE";
import Camera from "./Camera";
import Vector3 from "../Math/Vector/Vector3";
import POLY_ATTR from "./enum/POLY_ATTR";
import Object3D from "./Object3D";
import OBJECT_STATE from "./enum/OBJECT_STATE";
import Poly3D from "./Poly3D";

export default class RendList {
    state = 0
    attr = 0

    polyList = new Array<PolyF3D>()

    polyData = new Array<PolyF3D>()

    polyNumber = 0


    private static isSkip(poly: PolyF3D) {
        return poly == null ||
            !(poly.state & POLY_STATE.ACTIVE) ||
            (poly.state & POLY_STATE.CLIPPED) ||
            (poly.state & POLY_STATE.BACKFACE)
    }

    public transform(mt: Matrix4, coordSelect: TRANSFORM_TYPE) {

        for (let polyIndex = 0; polyIndex < this.polyNumber; polyIndex++) {
            const current = this.polyList[polyIndex]

            if (RendList.isSkip(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                switch (coordSelect) {
                    case TRANSFORM_TYPE.LOCAL_ONLY:
                        current.vList[vertexIndex].applyMatrix4(mt)
                        break;
                    case TRANSFORM_TYPE.TRANS_ONLY:
                        current.tvList[vertexIndex].applyMatrix4(mt)
                        break;
                    case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                        let result = current.vList[vertexIndex].clone()
                        result.applyMatrix4(mt)
                        current.tvList[vertexIndex].copy(result)
                        break;
                }


            }
        }
    }

    public modelToWorld(coordSelect: TRANSFORM_TYPE, worldPosition: Vector3) {
        for (let i = 0; i < this.polyNumber; i++) {
            const current = this.polyList[i]

            if (RendList.isSkip(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                switch (coordSelect) {
                    case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                        current.tvList[vertexIndex].addVectors(current.vList[vertexIndex], worldPosition);
                        break;
                    case TRANSFORM_TYPE.TRANS_ONLY:
                        current.tvList[vertexIndex].add(worldPosition);
                        break;
                }
            }
        }
    }


    public worldToCamera(camera: Camera) {
        for (let polyIndex = 0; polyIndex < this.polyNumber; polyIndex++) {
            const current = this.polyList[polyIndex]
            if (RendList.isSkip(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                current.tvList[vertexIndex].applyMatrix4(camera.mcam)
            }
        }
    }


    public removeBackFaces(camera: Camera) {
        for (let i = 0; i < this.polyNumber; i++) {
            const current = this.polyList[i];

            if (!current || !(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE) ||
                (current.attr & POLY_ATTR.DOUBLE_SIDE)) continue;

            const u = new Vector3(), v = new Vector3(), n = new Vector3()

            u.subVectors(current.tvList[1], current.tvList[0]);
            v.subVectors(current.tvList[2], current.tvList[0]);

            n.crossVectors(u, v);

            const view = new Vector3();

            view.subVectors(camera.position, current.tvList[0]);

            const dp = n.dot(view);

            if (dp <= 0) {
                current.state |= POLY_STATE.BACKFACE
            }
        }
    }

    public insertObject(object: Object3D, isInsertLocal = false) {

        if (!(object.state & OBJECT_STATE.AVTIVE) ||
            (object.state & OBJECT_STATE.CULLED) ||
            !(object.state & OBJECT_STATE.VISIBLE)) return;

        for (let i = 0; i < object.polysNum; i++) {
            const current = object.plist[i]

            if (!(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE)) continue

            let oldVlist = current.vlist;

            if (isInsertLocal) {
                current.vlist = object.vListLocal
            } else {
                current.vlist = object.vListTrans
            }

            this.insertPoly3D(current)

            current.vlist = oldVlist
        }
    }

    public insertPoly3D(poly: Poly3D) {
        if (this.polyNumber >= this.polyData.length) {
            this.polyData.push(new PolyF3D())
        }
        this.polyList[this.polyNumber] = this.polyData[this.polyNumber];

        const current :PolyF3D = this.polyData[this.polyNumber];
        current.state = poly.state
        current.attr = poly.attr
        current.color = poly.color

        current.tvList[0].copy(poly.vlist[poly.vert[0]]);
        current.tvList[1].copy(poly.vlist[poly.vert[1]]);
        current.tvList[2].copy(poly.vlist[poly.vert[2]]);


        current.vList[0].copy(poly.vlist[poly.vert[0]]);
        current.vList[1].copy(poly.vlist[poly.vert[1]]);
        current.vList[2].copy(poly.vlist[poly.vert[2]]);


        if (this.polyNumber === 0) {
            current.next = null
            current.prev = null
        } else {
            current.next = null
            current.prev = this.polyData[this.polyNumber - 1]
            this.polyData[this.polyNumber - 1].next = current
        }

        this.polyNumber++

    }

    public insertPolyF3D(poly3d: PolyF3D) {

        if (this.polyNumber >= this.polyData.length) {
            this.polyData.push(new PolyF3D())
        }

        this.polyList[this.polyNumber] = this.polyData[this.polyNumber]

        const current = this.polyData[this.polyNumber]


        current.copy(poly3d)

        if (this.polyNumber === 0) {
            current.next = null
            current.prev = null
        } else {
            current.next = null
            current.prev = this.polyData[this.polyNumber - 1]
            this.polyData[this.polyNumber - 1].next = current
        }
        this.polyNumber++
    }

    public reset(){
        this.polyNumber = 0
    }
}
