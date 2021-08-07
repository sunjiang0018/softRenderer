export default class Euler{
    private _x:number
    private _y:number
    private _z:number
    private _order:string

    constructor(x = 0,y = 0, z = 0, order = 'XYZ') {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
    }

    get x() {

        return this._x;

    }

    set x( value ) {

        this._x = value;

    }

    get y() {

        return this._y;

    }

    set y( value ) {

        this._y = value;

    }

    get z() {

        return this._z;

    }

    set z( value ) {

        this._z = value;

    }

    get order() {

        return this._order;

    }

    set order( value ) {

        this._order = value;

    }
}
