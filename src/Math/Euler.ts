import {clamp} from "../Utils/MathUilts";
import Quaternion from "./Quaternion";
import Matrix4 from "./Matrix/Matrix4";
import Vector3 from "./Vector/Vector3";



export default class Euler {
    private _x: number
    private _y: number
    private _z: number
    private _order: string

    static DefaultOrder = 'XYZ';
    static RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']

    constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
    }

    get x() {

        return this._x;

    }

    set x(value) {

        this._x = value;

    }

    get y() {

        return this._y;

    }

    set y(value) {

        this._y = value;

    }

    get z() {

        return this._z;

    }

    set z(value) {

        this._z = value;

    }

    get order() {

        return this._order;

    }

    set order(value) {

        this._order = value;

    }

    set(x: number, y: number, z: number, order = this._order) {

        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;


        return this;

    }

    clone() {

        return new Euler(this._x, this._y, this._z, this._order);

    }

    copy(euler: Euler) {

        this._x = euler._x;
        this._y = euler._y;
        this._z = euler._z;
        this._order = euler._order;


        return this;

    }

    setFromRotationMatrix(m:Matrix4, order = this._order) {

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

        const te = m.elements;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        switch (order) {

            case 'XYZ':

                this._y = Math.asin(clamp(m13, -1, 1));

                if (Math.abs(m13) < 0.9999999) {

                    this._x = Math.atan2(-m23, m33);
                    this._z = Math.atan2(-m12, m11);

                } else {

                    this._x = Math.atan2(m32, m22);
                    this._z = 0;

                }

                break;

            case 'YXZ':

                this._x = Math.asin(-clamp(m23, -1, 1));

                if (Math.abs(m23) < 0.9999999) {

                    this._y = Math.atan2(m13, m33);
                    this._z = Math.atan2(m21, m22);

                } else {

                    this._y = Math.atan2(-m31, m11);
                    this._z = 0;

                }

                break;

            case 'ZXY':

                this._x = Math.asin(clamp(m32, -1, 1));

                if (Math.abs(m32) < 0.9999999) {

                    this._y = Math.atan2(-m31, m33);
                    this._z = Math.atan2(-m12, m22);

                } else {

                    this._y = 0;
                    this._z = Math.atan2(m21, m11);

                }

                break;

            case 'ZYX':

                this._y = Math.asin(-clamp(m31, -1, 1));

                if (Math.abs(m31) < 0.9999999) {

                    this._x = Math.atan2(m32, m33);
                    this._z = Math.atan2(m21, m11);

                } else {

                    this._x = 0;
                    this._z = Math.atan2(-m12, m22);

                }

                break;

            case 'YZX':

                this._z = Math.asin(clamp(m21, -1, 1));

                if (Math.abs(m21) < 0.9999999) {

                    this._x = Math.atan2(-m23, m22);
                    this._y = Math.atan2(-m31, m11);

                } else {

                    this._x = 0;
                    this._y = Math.atan2(m13, m33);

                }

                break;

            case 'XZY':

                this._z = Math.asin(-clamp(m12, -1, 1));

                if (Math.abs(m12) < 0.9999999) {

                    this._x = Math.atan2(m32, m22);
                    this._y = Math.atan2(m13, m11);

                } else {

                    this._x = Math.atan2(-m23, m33);
                    this._y = 0;

                }

                break;

            default:

                console.warn('THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);

        }

        this._order = order;


        return this;

    }

    setFromQuaternion(q:Quaternion, order:string) {

        _matrix.makeRotationFromQuaternion(q);

        return this.setFromRotationMatrix(_matrix, order);

    }

    setFromVector3(v:Vector3, order = this._order) {

        return this.set(v.x, v.y, v.z, order);

    }

    reorder(newOrder:string) {

        // WARNING: this discards revolution information -bhouston

        _quaternion.setFromEuler(this);

        return this.setFromQuaternion(_quaternion, newOrder);

    }

    equals(euler:Euler) {

        return (euler._x === this._x) && (euler._y === this._y) && (euler._z === this._z) && (euler._order === this._order);

    }



    toVector3(optionalResult:Vector3) {

        if (optionalResult) {

            return optionalResult.set(this._x, this._y, this._z);

        } else {

            return new Vector3(this._x, this._y, this._z);

        }

    }
}

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion = /*@__PURE__*/ new Quaternion();
