enum CULL_OBJECT {
    X_PLANE = 0x0001,
    Y_PLANE = 0x0002,
    Z_PLANE = 0x0004,
    XYZ_PLANES = CULL_OBJECT.X_PLANE | CULL_OBJECT.Y_PLANE | CULL_OBJECT.Z_PLANE
}

export default CULL_OBJECT
