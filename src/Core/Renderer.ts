import PLGLoader from "../Loader/PLGLoader";
import Object3D from "./Object3D";
import Camera from "./Camera";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import RendList from "./RendList";
import POLY_STATE from "./enum/POLY_STATE";

export default class Renderer {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    buffer: ImageBitmap | undefined

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width
        this.height = height
        const loader = new PLGLoader('./ModelFile/cube1.plg')
        loader.loader()
    }


    public start() {

        createImageBitmap(this.ctx.canvas)
            .then(bitmap => {
                this.buffer = bitmap
                this.update()
            })
    }

    private draw() {

    }

    private update() {
        this.draw()
        // @ts-ignore
        this.ctx.drawImage(this.buffer, 0, 0)
        requestAnimationFrame(this.update.bind(this))
    }


    objCameraToPerspective(object: Object3D, camera: Camera) {
        for (let i = 0; i < object.verticesNumber; i++) {
            const current = object.vlistTrans[i]
            const z = current.z;

            current.x = camera.viewDist * object.vlistTrans[i].x / z;
            current.y = camera.viewDist * current.y * camera.aspectRatio / z;
        }
    }

    objCameraToPerspectiveByMatrix(object: Object3D, camera: Camera) {
        const mper = new Matrix4(
            camera.viewDist, 0, 0, 0,
            0, camera.viewDist * camera.aspectRatio, 0, 0,
            0, 0, 1, 1,
            0, 0, 0, 0,
        )

        object.transform(mper, TRANSFORM_TYPE.TRANS_ONLY)
    }

    rendListCameraToPerspective(rendList: RendList, camera: Camera) {
        for (let i = 0; i < rendList.polyNumber; i++) {
            const current = rendList.polyList[i];

            if (!current || !(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE)) continue;

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                const currVertex = current.tvlist[vertexIndex];
                const z = currVertex.z;
                currVertex.x = camera.viewDist * currVertex.x / z;
                currVertex.y = camera.viewDist * currVertex.y * camera.aspectRatio / z;
            }
        }

    }

    rendListCameraToPerspectiveByMatrix(rendList: RendList, camera: Camera) {
        const mper = new Matrix4(
            camera.viewDist, 0, 0, 0,
            0, camera.viewDist * camera.aspectRatio, 0, 0,
            0, 0, 1, 1,
            0, 0, 0, 0,
        )

        rendList.transform(mper, TRANSFORM_TYPE.TRANS_ONLY);
    }




    objPerspectiveToScreen(object:Object3D, camera:Camera){
        const alpha = (0.5 * camera.viewportWidth - 0.5)
        const beta = (0.5 * camera.viewportHeight - 0.5)
        for (let i = 0; i < object.verticesNumber; i++) {
            object.vlistTrans[i].x = alpha + alpha * object.vlistLocal[i].x;
            object.vlistTrans[i].y = beta - beta * object.vlistTrans[i].y;
        }
    }

    objPerspectiveToScreenByMatrix(object:Object3D, camera:Camera){
        const alpha = (0.5 * camera.viewportWidth - 0.5)
        const beta = (0.5 * camera.viewportHeight - 0.5)
        const mper = new Matrix4(
            alpha, 0, 0, 0,
            0, -beta, 0, 0,
            alpha, beta, 1, 1,
            0, 0, 0, 1,
        )
        object.transform(mper,TRANSFORM_TYPE.TRANS_ONLY)
    }


    rendListPerspectiveToScreen(rendList: RendList, camera: Camera) {
        for (let i = 0; i < rendList.polyNumber; i++) {
            const current = rendList.polyList[i];

            if (!current || !(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE)) continue;

            const alpha = (0.5 * camera.viewportWidth - 0.5)
            const beta = (0.5 * camera.viewportHeight - 0.5)

            for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
                const currVertex = current.tvlist[vertexIndex];
                currVertex.x = alpha + alpha * currVertex.x;
                currVertex.y = beta - beta * currVertex.y;
            }
        }

    }

    rendListPerspectiveToScreenByMatrix(rendList: RendList, camera: Camera) {
        const alpha = (0.5 * camera.viewportWidth - 0.5)
        const beta = (0.5 * camera.viewportHeight - 0.5)
        const mper = new Matrix4(
            alpha, 0, 0, 0,
            0, -beta, 0, 0,
            alpha, beta, 1, 1,
            0, 0, 0, 1,
        )

        rendList.transform(mper, TRANSFORM_TYPE.TRANS_ONLY);
    }


}
