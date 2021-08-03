export default class Vector2 {
    x: number
    y: number

    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    subVector(v:Vector2){
        return new Vector2(this.x - v.x, this.y - v.y)
    }

}
