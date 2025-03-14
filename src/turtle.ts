/**
 * Onscreen turtle controlled by Turt code.
 */
export default class Turtle {
    private p5: p5;
    position: p5.Vector;
    heading: number;
    drawing: boolean = true;
    hideSprite: boolean = false;

    constructor(p5: p5) {
        this.p5 = p5;
        this.reset()
    }

    reset() {
        this.position = this.p5.createVector(this.p5.width / 2, this.p5.height / 2);
        this.heading = 0;
        this.drawing = true;
        this.hideSprite = false;
    }

    /**
     * Draws the turtle and everything that has been drawn to the canvas.
     */
    render() {
        // draw the turtle's sprite (if shown)
        if (this.hideSprite) { return; }

        this.p5.stroke("#000000");
        this.p5.strokeWeight(3);
        this.p5.fill("#ffffff");

        this.p5.push();
        this.p5.translate(this.position);
        this.p5.rotate(this.heading);
        this.p5.triangle(
              0, -15,
             12,  15,
            -12,  15
        );
        this.p5.pop();
    }

    moveFwd(distance: number) {
        this.position.add(
            Math.cos(this.heading) * distance,
            Math.sin(this.heading) * distance
        );
    }
}