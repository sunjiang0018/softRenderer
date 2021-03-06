import Object3D from "../Core/Object3D";
import OBJECT_STATE from "../Core/enum/OBJECT_STATE";
import Poly3D from "../Core/Poly3D";
import POLY_ATTR from "../Core/enum/POLY_ATTR";
import SHADE_MODE from "../Core/enum/SHADE_MODE";
import POLY_STATE from "../Core/enum/POLY_STATE";
import Vector3 from "../Math/Vector/Vector3";
import Vertex from "../Core/Vertex";

export default class PLGLoader {

    fileUrl: string

    constructor(fileUrl: string) {
        this.fileUrl = fileUrl
    }

    loader(): Promise<Object3D> {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest()
            const self = this

            request.open('GET', this.fileUrl, true)

            request.addEventListener('load', function (event) {
                const data: string = this.response
                const object = new Object3D()

                object.state = OBJECT_STATE.AVTIVE | OBJECT_STATE.VISIBLE

                const lines = data
                    .split('\r\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && !line.startsWith('#'))

                let index = 0
                if (lines.length <= 0) {
                    reject('文件为空')
                }

                const firstLine = lines[index].split(/ +/)

                if (firstLine.length !== 3 && firstLine[0] !== 'tri') {
                    reject('文件格式不正确！')
                }

                object.verticesNumber = parseInt(firstLine[1])
                object.polysNum = parseInt(firstLine[2])

                if (object.polysNum + object.verticesNumber + 1 !== lines.length) {
                    reject('顶点个数或多边形个数不正确')
                }

                try {
                    self.readVerticesList(object, ++index, object.verticesNumber, lines)
                    index += object.verticesNumber
                    self.readPolyList(object, index, object.polysNum, lines)
                    self.computeObjectRadius(object)
                    resolve(object)
                } catch (e) {
                    reject(e)
                }

            })

            request.send()

        })
    }

    private readVerticesList(object: Object3D, start: number, count: number, lines: string[]) {
        for (let i = 0; i < count; i++, start) {
            const line = lines[start + i]
            const number = line.split(/ +/)

            if (number.length !== 3) throw new Error('顶点格式错误')

            const vertex = new Vertex()
            vertex.v.set(parseFloat(number[0]), parseFloat(number[1]), parseFloat(number[2]))

            object.vListLocal.push(vertex)
            object.vListTrans.push(vertex.clone())
        }
    }

    private readPolyList(object: Object3D, start: number, count: number, lines: string[]) {
        for (let i = 0; i < count; i++) {
            const line = lines[start + i]
            const number = line.split(/ +/)
            const vertxNumber = parseInt(number[1])

            if (number.length !== vertxNumber + 2 || !number[0].startsWith('0x')) throw new Error('多边形格式错误')

            const poly = new Poly3D()
            poly.vlist = object.vListLocal

            const polySurfaceDesc = parseInt(number[0])
            poly.vert[0] = parseInt(number[2])
            poly.vert[1] = parseInt(number[3])
            poly.vert[2] = parseInt(number[4])
            this.setAttributes(poly, polySurfaceDesc)

            object.plist.push(poly)

        }
    }

    private computeObjectRadius(object: Object3D) {
        object.avgRadius[0] = 0
        object.maxRadius[0] = 0
        for (let i = 0; i < object.verticesNumber; i++) {
            const x = object.vListLocal[i].v.x
            const y = object.vListLocal[i].v.y
            const z = object.vListLocal[i].v.z

            let distToVertex = Math.sqrt(x * x + y * y + z * z)

            object.avgRadius[0] += distToVertex

            if (object.maxRadius[0] < distToVertex) object.maxRadius[0] = distToVertex
        }

        object.avgRadius[0] /= object.verticesNumber
    }

    private setAttributes(poly: Poly3D, polySurfaceDesc: number) {

        // 设置多边形单边/双面渲染
        if (polySurfaceDesc & POLY_ATTR.DOUBLE_SIDE) {
            poly.attr |= POLY_ATTR.DOUBLE_SIDE
        }

        // 设置多边形颜色
        const red = ((polySurfaceDesc & 0x0f00) >> 8);
        const green = ((polySurfaceDesc & 0x00f0) >> 4);
        const blue = (polySurfaceDesc & 0x000f);

        poly.color = this.toHEX565(red, green, blue)

        // 设置着色模式
        const shadeMode = polySurfaceDesc & 0x6000

        switch (shadeMode) {
            case SHADE_MODE.PURE_FLAG:
                poly.attr |= SHADE_MODE.PURE_FLAG
                break;
            case SHADE_MODE.FLAT_FLAG:
                poly.attr |= SHADE_MODE.FLAT_FLAG
                break;
            case SHADE_MODE.GOURAUD_FLAG:
                poly.attr |= SHADE_MODE.GOURAUD_FLAG
                break;
            case SHADE_MODE.PHONG_FLAG:
                poly.attr |= SHADE_MODE.PHONG_FLAG
                break;
        }

        poly.state = POLY_STATE.ACTIVE

    }

    private toHEX565(red: number, green: number, blue: number) {
        red *= 16
        green *= 16
        blue *= 16

        return new Vector3(red, green, blue)
    }


}

