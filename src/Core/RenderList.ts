import PolyF4D from "./PolyF4D";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import POLY_STATE from "./enum/POLY_STATE";

export default class RenderList{
    state = 0
    attr = 0

    polyList = new Array<PolyF4D>()

    polyData = new Array<PolyF4D>()

    polyNumber = 0

    transform(mt:Matrix4, coordSelect:TRANSFORM_TYPE){

        for (let polyIndex = 0; polyIndex < this.polyNumber; polyIndex++) {
            const current = this.polyList[polyIndex]

            if(current == null ||
                !(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state && POLY_STATE.BACKFACE)){
                continue;
            }
            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                switch (coordSelect){
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
}
