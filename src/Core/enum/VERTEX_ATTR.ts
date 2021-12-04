enum VERTEX_ATTR {
    NULL,
    POINT = 0x0001, // 点
    NORMAL = 0x0002,// 点 + 法线
    TEXTURE = 0x0004// 点 + 法线 + 纹理坐标
}

export default VERTEX_ATTR
