export class SignaturePad {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx = canvas.getContext("2d");

        this.isDrawing = false;

        this.hasSignature = false;

        this.lineWidth = 2;

        this.color = "#111827";

        this.initialize();

    }

    initialize() {

        this.ctx.lineWidth = this.lineWidth;

        this.ctx.lineCap = "round";

        this.ctx.lineJoin = "round";

        this.ctx.strokeStyle = this.color;

        this.resize();

        this.bindEvents();

    }

    bindEvents() {

    // Mouse

    this.canvas.addEventListener(

        "mousedown",

        this.startDrawing.bind(this)

    );

    this.canvas.addEventListener(

        "mousemove",

        this.draw.bind(this)

    );

    window.addEventListener(

        "mouseup",

        this.stopDrawing.bind(this)

    );

    // Touch

    this.canvas.addEventListener(

        "touchstart",

        this.startTouch.bind(this),

        { passive:false }

    );

    this.canvas.addEventListener(

        "touchmove",

        this.moveTouch.bind(this),

        { passive:false }

    );

    window.addEventListener(

        "touchend",

        this.stopDrawing.bind(this)

    );

}

    startDrawing(event) {

        this.isDrawing = true;

        const { x, y } = this.getPosition(event);

        this.ctx.beginPath();

        this.ctx.moveTo(x, y);

    }

    draw(event) {

        if (!this.isDrawing) {

            return;

        }
        

        const { x, y } = this.getPosition(event);

        this.ctx.lineTo(x, y);

        this.ctx.stroke();

        this.hasSignature = true;

    }

startTouch(event){

    event.preventDefault();

    this.isDrawing = true;

    const { x, y } =

        this.getTouchPosition(event);

    this.ctx.beginPath();

    this.ctx.moveTo(x,y);

}

moveTouch(event){

    event.preventDefault();

    if(!this.isDrawing){

        return;

    }

    const { x, y } =

        this.getTouchPosition(event);

    this.ctx.lineTo(x,y);

    this.ctx.stroke();

    this.hasSignature = true;

}

    stopDrawing(){

    if(!this.isDrawing){

        return;

    }

    this.isDrawing = false;

    this.ctx.closePath();

}

    getPosition(event) {

        const rect =

            this.canvas.getBoundingClientRect();

        return {

            x: event.clientX - rect.left,

            y: event.clientY - rect.top

        };

    }

    clear(){

    this.ctx.clearRect(

        0,

        0,

        this.canvas.width,

        this.canvas.height

    );

    this.ctx.beginPath();

    this.hasSignature = false;

}

    getTouchPosition(event){

    const rect =

        this.canvas.getBoundingClientRect();

    const touch =

        event.touches[0];

    return{

        x:

            touch.clientX

            - rect.left,

        y:

            touch.clientY

            - rect.top

    };

}

resize(){

    const rect =

        this.canvas.parentElement

            .getBoundingClientRect();

    this.canvas.width =

        rect.width;

    this.canvas.height =

        260;

}

// TODO:
// En la versión 2 conservar la firma
// al redimensionar el canvas.

    export() {

        return this.canvas.toDataURL(

            "image/png"

        );

    }

    isEmpty() {

        return !this.hasSignature;

    }

    destroy() {

        // Reservado para futuras versiones

    }

}