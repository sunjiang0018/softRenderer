import PolyF3D from "./PolyF3D";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import POLY_STATE from "./enum/POLY_STATE";
import Camera from "./Camera";
import Vector3 from "../Math/Vector/Vector3";
import POLY_ATTR from "./enum/POLY_ATTR";

export default class RendList {
    state = 0
    attr = 0

    polyList = new Array<PolyF3D>()

    polyData = new Array<PolyF3D>()

    polyNumber = 0


    private static isRender(poly: PolyF3D) {
        return poly == null ||
            !(poly.state & POLY_STATE.ACTIVE) ||
            (poly.state & POLY_STATE.CLIPPED) ||
            (poly.state && POLY_STATE.BACKFACE)
    }

    public transform(mt: Matrix4, coordSelect: TRANSFORM_TYPE) {

        for (let polyIndex = 0; polyIndex < this.polyNumber; polyIndex++) {
            const current = this.polyList[polyIndex]

            if (RendList.isRender(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                switch (coordSelect) {
                    case TRANSFORM_TYPE.LOCAL_ONLY:
                        current.vlist[vertexIndex].applyMatrix4(mt)
                        break;
                    case TRANSFORM_TYPE.TRANS_ONLY:
                        current.tvlist[vertexIndex].applyMatrix4(mt)
                        break;
                    case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                        let result = current.vlist[vertexIndex].clone()
                        result.applyMatrix4(mt)
                        current.tvlist[vertexIndex].copy(result)
                        break;
                }


            }
        }
    }

    public modelToWorld(coordSelect: TRANSFORM_TYPE, worldPosition: Vector3) {
        for (let i = 0; i < this.polyNumber; i++) {
            const current = this.polyList[i]

            if (RendList.isRender(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                switch (coordSelect) {
                    case TRANSFORM_TYPE.LOCAL_TO_TRANS:
                        current.tvlist[vertexIndex].addVectors(current.vlist[vertexIndex], worldPosition);
                        break;
                    case TRANSFORM_TYPE.TRANS_ONLY:
                        current.tvlist[vertexIndex].add(worldPosition);
                        break;
                }
            }
        }
    }


    public worldToCamera(camera: Camera) {
        for (let polyIndex = 0; polyIndex < this.polyNumber; polyIndex++) {
            const current = this.polyList[polyIndex]
            if (RendList.isRender(current)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                current.tvlist[vertexIndex].applyMatrix4(camera.mcam)
            }
        }
    }


    public removeBackFaces(camera : Camera){
        for (let i = 0; i < this.polyNumber; i++) {
            const current = this.polyList[i];

            if(!current || (current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE) ||
                (current.attr & POLY_ATTR.DOUBLE_SIDE)) continue;

            const u = new Vector3(), v = new Vector3(), n = new Vector3()

            u.subVectors(current.tvlist[1], current.tvlist[0]);
            v.subVectors(current.tvlist[2], current.tvlist[0]);

            n.crossVectors(u,v);

            const view = new Vector3();

            view.addVectors(camera.position, current.tvlist[0]);

            const dp = n.dot(view);

            if(dp <= 0){
                current.state |= POLY_STATE.BACKFACE
            }
        }
    }
}
