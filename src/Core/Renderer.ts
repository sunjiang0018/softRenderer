import PLGLoader from "../Loader/PLGLoader";

export default class Renderer {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    buffer: ImageBitmap | undefined

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width
        this.height = height
        const loader = new PLGLoader('./ModelFile/cube1.plg')
        loader.loader()
    }


    public start() {

        createImageBitmap(this.ctx.canvas)
            .then(bitmap => {
                this.buffer = bitmap
                this.update()
            })
    }

    private draw(){

    }

    private update() {
        this.draw()
        // @ts-ignore
        this.ctx.drawImage(this.buffer, 0, 0)
        requestAnimationFrame(this.update.bind(this))
    }

}
