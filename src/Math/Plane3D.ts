import Vector3 from "./Vector/Vector3";
import Line3D from "./Line/Line3D";

export default class Plane3D{

    p0:Vector3
    n:Vector3

    constructor(p0:Vector3, n:Vector3) {
        this.p0 = p0
        this.n = n
    }

    computeInPlane(point:Vector3){
        return this.n.x * (point.x - this.p0.x) +
            this.n.y * (point.y - this.p0.y) +
            this.n.z * (point.z - this.p0.z);
    }


    /**
     * 返回相交点相对线段的插值t
     * @param line
     */
    intersectLine(line:Line3D){

        const epsilon = 0.001
        const dot = line.diection.dot(this.n)

        if(Math.abs(dot) <= epsilon){
            return -1;
        }

        return -(this.n.x*line.start.x +
        this.n.y*line.start.y +
        this.n.z*line.start.z -
        this.n.x*this.p0.x -
        this.n.y*this.p0.y -
        this.n.z*this.p0.z) / (dot);
    }


}
