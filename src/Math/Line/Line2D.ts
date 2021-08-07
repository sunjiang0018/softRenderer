import Vector2 from "../Vector/Vector2";

const EPSILON_E5 = 1E-5


export default class Line2D {
    start: Vector2
    end: Vector2
    direction:Vector2

    constructor(start: Vector2, end: Vector2) {
        this.start = start
        this.end = end
        this.direction = this.start.clone().subVectors(this.end, this.start)
    }


    intersect(L: Line2D) {
        const LDir = L.start.clone().subVectors(L.end, L.end)

        const denominator = this.direction.cross(LDir)
        if (Math.abs(denominator) <= EPSILON_E5) {
            return Infinity
        }

        const vet = new Vector2().subVectors(this.start,L.start)
        return this.direction.cross(vet) / denominator;
    }


}
