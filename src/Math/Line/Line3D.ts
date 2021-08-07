import Vector3 from "../Vector/Vector3";
import Matrix4 from "../Matrix/Matrix4";
import Vector2 from "../Vector/Vector2";

export default class Line3D {
    start: Vector3
    end: Vector3
    diection:Vector3

    constructor(p0: Vector3 = new Vector3(), p1: Vector3 = new Vector3()) {
        this.start = p0
        this.end = p1
        this.diection = this.start.clone().subVectors(this.end, this.start)
    }

    delta(target: Vector3) {

        return target.subVectors(this.end, this.start);

    }

    distanceSq() {

        return this.start.distanceToSquared(this.end);

    }

    distance() {

        return this.start.distanceTo(this.end);

    }

    at(t: number, target: Vector3) {

        return this.delta(target).multiplyScalar(t).add(this.start);

    }

    applyMatrix4(matrix: Matrix4) {

        this.start.applyMatrix4(matrix);
        this.end.applyMatrix4(matrix);

        return this;

    }

    copy(line: Line3D) {

        this.start.copy(line.start);
        this.end.copy(line.end);

        return this;

    }

    equals(line: Line3D) {

        return line.start.equals(this.start) && line.end.equals(this.end);

    }

    clone() {

        return new Line3D().copy(this);

    }
}
