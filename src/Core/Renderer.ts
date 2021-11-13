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
import Euler from "../Math/Euler";

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
            this.objects.push(object)
        }).then(this.update.bind(this))
    }

    private draw() {
        this.clear()
        const matrix = new Matrix4()
        angle += 0.01
        matrix.makeRotationFromEuler(new Euler(angle, angle, 0, 'YXZ'))
        // this.renderByObject(matrix)
        this.renderByRendList(matrix)
    }

    private renderByObject(matrix: Matrix4) {
        for (let object of this.objects) {
            object.reset()
            object.worldPosition.set(0, 0, 10)
            object.transform(matrix, TRANSFORM_TYPE.LOCAL_TO_TRANS)
            object.modelToWorld(TRANSFORM_TYPE.TRANS_ONLY)
            object.removeBackFaces(this.camera)
            object.worldToCamera(this.camera)
            this.objCameraToPerspective(object, this.camera)
            this.objPerspectiveToScreen(object, this.camera)
            this.drawObject(object)
        }
    }

    private renderByRendList(matrix: Matrix4) {
        const rendlist = new RendList()
        for (let object of this.objects) {
            rendlist.insertObject(object)
        }
        rendlist.transform(matrix, TRANSFORM_TYPE.LOCAL_ONLY)
        rendlist.modelToWorld(TRANSFORM_TYPE.LOCAL_TO_TRANS, new Vector3(0, 0, 10))
        rendlist.removeBackFaces(this.camera)
        rendlist.worldToCamera(this.camera)
        this.rendListCameraToPerspective(rendlist, this.camera)
        this.rendListPerspectiveToScreen(rendlist, this.camera)
        this.drawRendList(rendlist)
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
            let c = new Vector2(object.vlistTrans[index2].x, object.vlistTrans[index2].y)
            this.drawTriangle(a, b, c, current.color)
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
            let c = new Vector2(current.tvlist[2].x, current.tvlist[2].y)

            let color = current.color
            this.drawTriangle(a, b, c, color)
        }
    }

    drawLine(a: Vector2, b: Vector2, color: Vector3) {

        a.x = Math.floor(a.x)
        a.y = Math.floor(a.y)
        b.x = Math.floor(b.x)
        b.y = Math.floor(b.y)

        const points = bresenham(a.x, a.y, b.x, b.y)
        points.forEach((point: { x: number; y: number; }) => {

            this.setColor(point.x, point.y, color)
        })
    }

    drawTriangle(pointA: Vector2, pointB: Vector2, pointC: Vector2, color: Vector3) {
        if ((pointA.x === pointB.x && pointB.x === pointC.x) || (pointA.y === pointB.y && pointB.y === pointC.y)) return;

        const min_clip_x = 0;
        const max_clip_x = this.width - 1;
        const min_clip_y = 0;
        const max_clip_y = this.height - 1;

        let temp = new Vector2(),
            a = pointA.clone(),
            b = pointB.clone(),
            c = pointC.clone()

        if (b.y < a.y) {
            temp.copy(b);
            b.copy(a);
            a.copy(temp);
        }

        if (c.y < a.y) {
            temp.copy(c);
            c.copy(a);
            a.copy(temp)
        }

        if (c.y < b.y) {
            temp.copy(c);
            c.copy(b);
            b.copy(temp);
        }

        if (c.y < min_clip_y || a.y > max_clip_y ||
            (a.x < min_clip_x && b.x < min_clip_x && c.x < min_clip_x) ||
            (a.x > max_clip_x && b.x > max_clip_x && c.x > max_clip_x))
            return;

        if (a.y === b.y) {
            this.drawTopTri(a, b, c, color)
        } else if (b.y === c.y) {
            this.drawBottomTri(a, b, c, color)
        } else {
            const newX = a.x + Math.floor(0.5 + (b.y - a.y) * (c.x - a.x) / (c.y - a.y));
            let temp = b.clone()
            temp.x = newX;
            this.drawTopTri(b.clone(), temp, c.clone(), color)
            this.drawBottomTri(a.clone(), temp, b.clone(), color)
        }

    }

    drawTopTri(pointA: Vector2, pointB: Vector2, pointC: Vector2, color: Vector3) {
        const min_clip_x = 0;
        const max_clip_x = this.width - 1;
        const min_clip_y = 0;
        const max_clip_y = this.height - 1;

        const a = pointA.clone(),
            b = pointB.clone(),
            c = pointC.clone();

        let temp = 0;

        if (b.x < a.x) {
            temp = b.x;
            b.x = a.x;
            a.x = temp;
        }

        const height = c.y - a.y;
        const dxLeft = (c.x - a.x) / height;
        const dxRight = (c.x - b.x) / height;

        let startX = a.x;
        let endX = b.x;

        if (a.y < min_clip_y) {
            startX = startX + dxLeft * (-a.y + min_clip_y);
            endX = endX + dxRight * (-b.x + min_clip_y);

            a.y = min_clip_y;
        }

        if (c.y > max_clip_y) {
            c.y = max_clip_y
        }


        if (a.x >= min_clip_x && a.x <= max_clip_x &&
            b.x >= min_clip_x && b.x <= max_clip_x &&
            c.x >= min_clip_x && c.x <= max_clip_x) {
            for (let tempY = Math.round(a.y); tempY <= Math.round(c.y); tempY++) {
                for (let i = Math.round(startX); i < Math.round(endX); i++) {
                    this.setColor(i, tempY, color)
                }
                startX += dxLeft
                endX += dxRight
            }

        } else {
            for (let tempY = Math.round(a.y); tempY <= Math.round(c.y); tempY++) {
                let left = Math.round(startX)
                let right = Math.round(endX)

                startX += dxLeft
                endX += dxRight

                // clip line
                if (left < min_clip_x) {
                    left = min_clip_x;

                    if (right < min_clip_x)
                        continue;
                }

                if (right > max_clip_x) {
                    right = max_clip_x;

                    if (left > max_clip_x)
                        continue;
                }
                for (let i = left; i < right; i++) {
                    this.setColor(i, tempY, color)
                }

            }
        }
    }

    drawBottomTri(pointA: Vector2, pointB: Vector2, pointC: Vector2, color: Vector3) {
        const min_clip_x = 0;
        const max_clip_x = this.width - 1;
        const min_clip_y = 0;
        const max_clip_y = this.height - 1;


        const a = pointA.clone(),
            b = pointB.clone(),
            c = pointC.clone();

        if (a.y === b.y || a.y === c.y) {
            return
        }
        let tempX

        if (c.x < b.x) {
            tempX = b.x;
            b.x = c.x;
            c.x = tempX;
        }

        const height = c.y - a.y

        const dxLeft = (b.x - a.x) / height
        const dxRight = (c.x - a.x) / height

        let startX = a.x
        let endX = a.x

        if (a.y < min_clip_y) {
            startX = startX + dxLeft * (-a.y + min_clip_y);
            endX = endX + dxRight * (-b.x + min_clip_y);

            a.y = min_clip_y;
        }

        if (c.y > max_clip_y) {
            c.y = max_clip_y
        }


        if (a.x >= min_clip_x && a.x <= max_clip_x &&
            b.x >= min_clip_x && b.x <= max_clip_x &&
            c.x >= min_clip_x && c.x <= max_clip_x) {
            for (let tempY = Math.round(a.y); tempY <= Math.round(c.y); tempY++) {
                for (let i = Math.round(startX); i < Math.round(endX); i++) {
                    this.setColor(i, tempY, color)
                }
                startX += dxLeft
                endX += dxRight
            }

        } else {
            for (let tempY = Math.round(a.y); tempY <= Math.round(c.y); tempY++) {
                let left = Math.round(startX)
                let right = Math.round(endX)

                startX += dxLeft
                endX += dxRight

                // clip line
                if (left < min_clip_x) {
                    left = min_clip_x;

                    if (right < min_clip_x)
                        continue;
                }

                if (right > max_clip_x) {
                    right = max_clip_x;

                    if (left > max_clip_x)
                        continue;
                }
                for (let i = left; i < right; i++) {
                    this.setColor(i, tempY, color)
                }

            }
        }

    }

    setColor(x: number, y: number, color: Vector3) {
        if (x < 0 || y < 0 || x > this.width || y > this.height) return;

        const index = (this.width * y + x) * 4
        this.buffer[index] = color.x;
        this.buffer[index + 1] = color.y;
        this.buffer[index + 2] = color.z;
        this.buffer[index + 3] = 255;
    }

    private update() {
        this.draw()
        this.camera.update()
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
