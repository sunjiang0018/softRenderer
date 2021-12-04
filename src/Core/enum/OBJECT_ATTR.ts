enum OBJECT_ATTR {
    SINGLE_FRAME = 0x0001,  // 单帧物体
    MULTI_FRAME = 0x0002,   // 多帧物体，用于支持.md2
    TEXTURES =0x0004        // 指出物体是否包含带问题的多边形
}

export default OBJECT_ATTR
