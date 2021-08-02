import React, {RefObject} from 'react';
import Renderer from "./core/Renderer";
import './App.css'

class App extends React.Component<any, any> {

    height: number
    width: number
    canvasRef: RefObject<HTMLCanvasElement>
    ctx:  CanvasRenderingContext2D| null | undefined
    renderer: Renderer | null


    constructor(props: Object) {
        super(props);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvasRef = React.createRef();
        this.renderer = null;
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current?.getContext('2d')
        if (!this.ctx) {
            console.error('浏览器不支持！！')
            return;
        }

        this.renderer = new Renderer(this.ctx,this.width,this.height)

        this.renderer.start()
    }

    render() {
        return <canvas id={'container'} width={this.width} height={this.height} ref={this.canvasRef}/>
    }

}

export default App;
