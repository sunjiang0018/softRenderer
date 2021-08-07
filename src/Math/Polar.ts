import Vector2 from "./Vector/Vector2";

export default class Polar {
    r: number
    theta: number

    constructor(r: number = 0, theta: number = 0) {
        this.r = r
        this.theta = theta
    }


    set(r: number, theta: number) {
        this.r = r
        this.theta = theta
    }

    setFromVector2(v: Vector2) {
        return this.setFromCartesianCoords(v.x, v.y)
    }

    setFromCartesianCoords(x: number, y: number) {
        this.r = Math.sqrt(x * x + y * y)
        this.theta = Math.atan2(y, x)
        return this;
    }

    copy(polar: Polar) {
        this.r = polar.r
        this.theta = polar.theta
        return this
    }

    clone(polar: Polar) {
        return new Polar().copy(polar)
    }
}
