import Vector3 from "./Vector/Vector3";

export default class Cylindrical {
    radius:number
    theta:number
    z:number

    constructor(r:number = -1, theta:number = 0, z:number = 0) {
        this.radius = r
        this.theta = theta
        this.z = z
    }

    get r(){
        return this.radius
    }

    set r(radius){
        this.radius = radius
    }


    set( radius:number, theta:number, z:number ) {

        this.radius = radius;
        this.theta = theta;
        this.z = z;

        return this;

    }

    copy( other:Cylindrical ) {

        this.radius = other.radius;
        this.theta = other.theta;
        this.z = other.z;

        return this;

    }

    setFromVector3( v:Vector3 ) {

        return this.setFromCartesianCoords( v.x, v.y, v.z );

    }

    setFromCartesianCoords( x:number, y:number, z:number ) {

        this.radius = Math.sqrt( x * x + z * z );
        this.theta = Math.atan2( x, z );
        this.z = z;

        return this;

    }

    clone() {

        return new Cylindrical().copy( this );

    }

}
