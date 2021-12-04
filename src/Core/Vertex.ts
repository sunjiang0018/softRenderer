import Vector2 from "../Math/Vector/Vector2";
import Vector3 from "../Math/Vector/Vector3";
import VERTEX_ATTR from "./enum/VERTEX_ATTR";

export default class Vertex {

    v = new Vector3()           // 顶点
    n = new Vector3()           // 法线
    t = new Vector2()           // 纹理坐标
    color = new Vector3()       // 经过光照后的顶点颜色
    attr = VERTEX_ATTR.NULL     // 属性


    clone(){
        const newVertex  = new Vertex()
        newVertex.v.copy(this.v)
        newVertex.n.copy(this.n)
        newVertex.t.copy(this.t)
        newVertex.color.copy(this.color)
        newVertex.attr = this.attr
       return newVertex
    }
}
