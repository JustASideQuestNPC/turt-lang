const TURTLE_COLORS = [
    "#000000",
];

/**
 * Onscreen turtle controlled by Turt code.
 */
export default class Turtle {
    sketch: p5;
    position: p5.Vector;
    heading: number = 0;
    strokeColor: number = 0;
    drawing: boolean = true;
    showSprite: boolean = true;

    constructor(sketch: p5, x: number, y: number) {
        this.sketch = sketch;
        this.position = sketch.createVector(x, y);
    }

    /**
     * Draws the turtle to the canvas.
     */
    render() {

    }
}