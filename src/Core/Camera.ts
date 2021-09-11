import Plane3D from "../Math/Plane3D";
import Matrix4 from "../Math/Matrix/Matrix4";
import Vector3 from "../Math/Vector/Vector3";

export default class Camera {
    state: number = 0
    attr: number = 0

    position: Vector3
    direction: Vector3

    // UVN模型的朝向向量
    u: Vector3 = new Vector3(1, 0, 0)
    v: Vector3 = new Vector3(0, 1, 0)
    n: Vector3 = new Vector3(0, 0, 1)
    target: Vector3

    //视距长度
    viewDist: number

    //水平方向和垂直方向的视野
    fov: number

    // 近远裁面————z轴的值
    nearFilpZ: number
    farFilpZ: number

    // 上下左右裁面
    rtClipPlane: Plane3D
    ltClipPlane: Plane3D
    tpClipPlane: Plane3D
    btClipPlane: Plane3D

    // 视平面的宽度和高度
    viewPlaneWidth: number
    viewPlaneHeight: number

    // 视口大小
    viewportWidth: number
    viewportHeight: number
    viewportCenterX: number //中心点位置
    viewportCenterY: number

    //屏幕宽高比
    aspectRatio: number

    mcam: Matrix4 = new Matrix4()        //用于存储世界坐标到相机坐标变换矩阵
    mper: Matrix4 = new Matrix4()        //用于存储相机坐标到透视坐标变换矩阵
    mscr: Matrix4 = new Matrix4()        //用于存储透视坐标到屏幕坐标转换矩阵


    constructor( position: Vector3, direction: Vector3, nearClipZ: number, farClipZ: number,
                fov: number, viewportWidth: number, viewportHeight: number) {
        this.attr = 0
        this.position = position.clone()
        this.direction = direction.clone()

        this.target = new Vector3(0,0,0)

        this.nearFilpZ = nearClipZ
        this.farFilpZ = farClipZ

        this.viewportWidth = viewportWidth
        this.viewportHeight = viewportHeight

        this.viewportCenterX = (viewportWidth - 1) / 2
        this.viewportCenterY = (viewportHeight - 1) / 2

        this.aspectRatio = viewportWidth / viewportHeight

        this.fov = fov

        this.viewPlaneWidth = 2
        this.viewPlaneHeight = 2 / this.aspectRatio

        const tanFovDiv2 = Math.tan(Math.PI / 180 * (fov / 2))
        this.viewDist = 0.5 * this.viewPlaneWidth * tanFovDiv2
        const origin = new Vector3()
        const vn = new Vector3()
        if (this.fov === 90) {
            vn.set(1, 0, -1)
            this.rtClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(-1, 0, -1)
            this.ltClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(0, 1, -1)
            this.tpClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(0, -1, -1)
            this.btClipPlane = new Plane3D(origin.clone(), vn.clone())
        } else {
            vn.set(this.viewDist, 0, -this.viewPlaneWidth / 2)
            this.rtClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(-this.viewDist, 0, -this.viewPlaneWidth / 2)
            this.ltClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(0, this.viewDist, -this.viewPlaneWidth / 2)
            this.tpClipPlane = new Plane3D(origin.clone(), vn.clone())
            vn.set(0, -this.viewDist, -this.viewPlaneWidth / 2)
            this.btClipPlane = new Plane3D(origin.clone(), vn.clone())
        }
    }


    makeWithEuler(order: string) {
        const mt = new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -this.position.x, -this.position.y, -this.position.z, 1)
        const mx = new Matrix4(),
            my = new Matrix4(),
            mz = new Matrix4(),
            mrot = new Matrix4(),
            mtmp = new Matrix4()

        const thetaX = this.direction.x
        const thetaY = this.direction.y
        const thetaZ = this.direction.z

        let cosTheta = Math.cos(thetaX)
        let sinTheta = -Math.sin((thetaX))

        mx.set(
            1, 0, 0, 0,
            0, cosTheta, sinTheta, 0,
            0, -sinTheta, cosTheta, 0,
            0, 0, 0, 1)

        cosTheta = Math.cos(thetaY)
        sinTheta = -Math.sin(thetaY)

        my.set(
            cosTheta, 0, -sinTheta, 0,
            0, 1, 0, 0,
            sinTheta, 0, cosTheta, 0,
            0, 0, 0, 1)

        cosTheta = Math.cos(thetaZ)
        sinTheta = -Math.sin(thetaZ)

        mz.set(
            cosTheta, sinTheta, 0, 0,
            -sinTheta, cosTheta, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1)

        switch (order) {
            case 'XYZ':
                mtmp.multiplyMatrices(my, mx)
                mrot.multiplyMatrices(mz, mtmp)
                break;
            case 'YXZ':
                mtmp.multiplyMatrices(mx, my)
                mrot.multiplyMatrices(mz, mtmp)
                break;
            case 'XZY':
                mtmp.multiplyMatrices(mz, mx)
                mrot.multiplyMatrices(my, mtmp)
                break;
            case 'YZX':
                mtmp.multiplyMatrices(mz, my)
                mrot.multiplyMatrices(mx, mtmp)
                break;
            case 'ZYX':
                mtmp.multiplyMatrices(my, mz)
                mrot.multiplyMatrices(mx, mtmp)
                break;
            case 'ZXY':
                mtmp.multiplyMatrices(mx, mz)
                mrot.multiplyMatrices(my, mtmp)
                break;
        }

        this.mcam.multiplyMatrices(mrot, mt)

    }

    makeWithUVN(isSpherical: true) {
        let mt = new Matrix4(),
            uvn = new Matrix4()

        mt.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -this.position.x, -this.position.y, -this.position.z, 1,
        )

        if (isSpherical) {
            const phi = this.direction.x
            const theta = this.direction.y

            const sinPhi = Math.sin(phi)
            const cosPhi = Math.cos(phi)

            const sinTheta = Math.sin(theta)
            const cosTheta = Math.cos(theta)

            this.target.x = -1 * sinPhi * sinTheta;
            this.target.y = cosPhi
            this.target.z = sinPhi * cosTheta
        }

        this.n.subVectors(this.target, this.position)

        this.v.set(0,1,0)

        this.u.crossVectors(this.v, this.n)

        this.v.crossVectors(this.n, this.u)

        this.u.normalize()
        this.v.normalize()
        this.n.normalize()

        uvn.set(
            this.u.x, this.v.x,this.n.x,0,
            this.u.y,this.v.y,this.n.y,0,
            this.u.z,this.v.z,this.n.z,0,
            0,0,0,1)


        this.mcam.multiplyMatrices(uvn, mt)
    }

}
