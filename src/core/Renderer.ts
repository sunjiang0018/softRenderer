export default class Renderer {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    buffer: ImageBitmap | undefined

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width
        this.height = height
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
