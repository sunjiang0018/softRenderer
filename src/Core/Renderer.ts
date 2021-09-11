import PLGLoader from "../Loader/PLGLoader";
import Object3D from "./Object3D";
import Camera from "./Camera";
import Matrix4 from "../Math/Matrix/Matrix4";
import TRANSFORM_TYPE from "./enum/TRANSFORM_TYPE";
import RendList from "./RendList";
import POLY_STATE from "./enum/POLY_STATE";
import Vector3 from "../Math/Vector/Vector3";
import Vector2 from "../Math/Vector/Vector2";
// @ts-ignore
import bresenham from 'bresenham';
let angle = 0;

export default class Renderer {
    ctx: CanvasRenderingContext2D
    objects: Object3D[] = []
    width: number
    height: number
    imageData: ImageData
    buffer: Uint8ClampedArray
    camera: Camera

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width
        this.height = height
        this.imageData = {} as ImageData
        this.buffer = {} as Uint8ClampedArray
        this.camera = {} as Camera

    }


    public start() {

        this.createArrayBuffer(this.width, this.height)
            .then(buffer => {
                this.buffer = buffer
                this.imageData = new ImageData(buffer, this.width, this.height)
            })
            .then(() => {
                const cameraPosition = new Vector3(0, 0, -10)
                const camerDirection = new Vector3(0, 0, 0)
                this.camera = new Camera(cameraPosition, camerDirection, 50, 500, 90, this.width, this.height)
                this.camera.makeWithEuler('ZYX')
                const loader = new PLGLoader('./ModelFile/cube1.plg')
                return loader.loader()
            }).then(object => {
                debugger
                this.objects.push(object)
        }).then(this.update.bind(this))
    }

    private draw() {
        this.clear()
        const matrix = new Matrix4()
        angle += 0.01
        matrix.makeRotationY(angle)
        for (let object of this.objects){
            object.worldPosition.set(0,0,10)
            object.transform(matrix,TRANSFORM_TYPE.LOCAL_TO_TRANS)
            object.modelToWorld(TRANSFORM_TYPE.TRANS_ONLY)
            object.worldToCamera(this.camera)
            this.objCameraToPerspective(object,this.camera)
            this.objPerspectiveToScreen(object,this.camera)
            this.drawObject(object)
        }
    }

    private clear() {
        const data = this.buffer
        for (let i = 0; i < data.length / 4; i++) {
            const index = i * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
        }
    }

    private drawObject(object: Object3D) {
        for (let polyIndex = 0; polyIndex < object.polysNum; polyIndex++) {
            const current = object.plist[polyIndex]

            if (!(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE)) continue

            const index0 = current.vert[0];
            const index1 = current.vert[1];
            const index2 = current.vert[2];

            let a = new Vector2(object.vlistTrans[index0].x, object.vlistTrans[index0].y)
            let b = new Vector2(object.vlistTrans[index1].x, object.vlistTrans[index1].y)
            let color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
            a = new Vector2(object.vlistTrans[index1].x, object.vlistTrans[index1].y)
            b = new Vector2(object.vlistTrans[index2].x, object.vlistTrans[index2].y)
            color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
            a = new Vector2(object.vlistTrans[index2].x, object.vlistTrans[index2].y)
            b = new Vector2(object.vlistTrans[index0].x, object.vlistTrans[index0].y)
            color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
        }
    }

    private drawRendList(rendList: RendList) {
        for (let i = 0; i < rendList.polyNumber; i++) {
            const current = rendList.polyList[i]

            if (!current || !(current.state & POLY_STATE.ACTIVE) ||
                (current.state & POLY_STATE.CLIPPED) ||
                (current.state & POLY_STATE.BACKFACE)) continue;

            let a = new Vector2(current.tvlist[0].x, current.tvlist[0].y)
            let b = new Vector2(current.tvlist[1].x, current.tvlist[1].y)
            let color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
            a = new Vector2(current.tvlist[1].x, current.tvlist[1].y)
            b = new Vector2(current.tvlist[2].x, current.tvlist[2].y)
            color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
            a = new Vector2(current.tvlist[2].x, current.tvlist[2].y)
            b = new Vector2(current.tvlist[0].x, current.tvlist[0].y)
            color = new Vector3(255, 255, 255)
            this.drawLine(a, b, color);
        }
    }

    drawLine(a: Vector2, b: Vector2, color: Vector3) {

        a.x = Math.floor(a.x)
        a.y = Math.floor(a.y)
        b.x = Math.floor(b.x)
        b.y = Math.floor(b.y)

        // a.x = Math.min(this.width - 1, a.x)
        // a.x = Math.max(0, a.x)
        // a.y = Math.min(this.height - 1, a.y)
        // a.y = Math.max(0, a.y)
        // b.x = Math.min(this.width - 1, b.x)
        // b.x = Math.max(0, b.x)
        // b.y = Math.min(this.height - 1, b.y)
        // b.y = Math.max(0, b.y)

        // boolean steep := abs(y1 - y0) > abs(x1 - x0)
        // if steep then
        // swap(x0, y0)
        // swap(x1, y1)
        // if x0 > x1 then
        // swap(x0, x1)
        // swap(y0, y1)
        // int deltax := x1 - x0
        // int deltay := abs(y1 - y0)
        // int error := deltax / 2
        // int ystep
        // int y := y0
        // if y0 < y1 then ystep := 1 else ystep := -1
        // for x from x0 to x1
        // if steep then plot(y,x) else plot(x,y)
        // error := error - deltay
        // if error < 0 then
        // y := y + ystep
        // error := error + deltax

        const points = bresenham(a.x, a.y, b.x, b.y)
        points.forEach((point: { x: number; y: number; }) =>{

            this.setColor(point.x, point.y, color)
        })
    }

    setColor(x: number, y: number, color: Vector3) {
        const index = (this.width * y + x) * 4
        this.buffer[index] = color.x;
        this.buffer[index + 1] = color.y;
        this.buffer[index + 2] = color.z;
        this.buffer[index + 3] = 255;
    }

    private update() {
        this.draw()
        // @ts-ignore
        this.imageData && this.ctx.putImageData(this.imageData, 0, 0)
        requestAnimationFrame(this.update.bind(this))
    }

    private createArrayBuffer(width: number, height: number): Promise<Uint8ClampedArray> {
        return new Promise((resolve, reject) => {
            const buffer = new ArrayBuffer(width * height * 4)
            const data = new Uint8ClampedArray(buffer)


            resolve(data)
        })
    }


    objCameraToPerspective(object: Object3D, camera: Camera) {
        for (let i = 0; i < object.verticesNumber; i++) {
            const current = object.vlistTrans[i]
            const z = current.z;

            current.x = camera.viewDist * current.x / z;
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


    objPerspectiveToScreen(object: Object3D, camera: Camera) {
        const alpha = (0.5 * camera.viewportWidth - 0.5)
        const beta = (0.5 * camera.viewportHeight - 0.5)
        for (let i = 0; i < object.verticesNumber; i++) {
            object.vlistTrans[i].x = alpha + alpha * object.vlistTrans[i].x;
            object.vlistTrans[i].y = beta - beta * object.vlistTrans[i].y;
        }
    }

    objPerspectiveToScreenByMatrix(object: Object3D, camera: Camera) {
        const alpha = (0.5 * camera.viewportWidth - 0.5)
        const beta = (0.5 * camera.viewportHeight - 0.5)
        const mper = new Matrix4(
            alpha, 0, 0, 0,
            0, -beta, 0, 0,
            alpha, beta, 1, 1,
            0, 0, 0, 1,
        )
        object.transform(mper, TRANSFORM_TYPE.TRANS_ONLY)
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
