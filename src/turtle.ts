/**
 * Onscreen turtle controlled by Turt code.
 */
export default class Turtle {
    position: p5.Vector;
    heading: number;
    drawing: boolean;
    hideSprite: boolean;

    private p5: p5;
    private glideSpeed: number;
    private gliding_: boolean;
    private glidePos: p5.Vector;

    constructor(p5: p5, glideSpeed: number) {
        this.p5 = p5;
        this.glideSpeed = glideSpeed;
        this.glidePos = this.p5.createVector();
        this.reset()
    }

    reset() {
        this.position = this.p5.createVector(this.p5.width / 2, this.p5.height / 2);
        this.heading = -Math.PI / 2;
        this.drawing = true;
        this.hideSprite = false;
        this.gliding_ = false;
    }

    /**
     * Updates glide position.
     */
    updateGlide() {
        if (this.gliding) {
            // native delta time is in milliseconds
            const dt = this.p5.deltaTime / 1000;
            
            const moveDistance = this.glideSpeed * dt;
            if (moveDistance > this.position.dist(this.glidePos)) {
                this.position.set(this.glidePos);
                this.gliding_ = false;
                // console.log("stopped gliding");
            }
            else {
                const moveAngle = this.glidePos.copy().sub(this.position).heading();
                this.position.add(
                    Math.cos(moveAngle) * moveDistance,
                    Math.sin(moveAngle) * moveDistance
                );
            }
        }
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
        this.p5.rotate(this.heading + Math.PI / 2);
        this.p5.triangle(
              0, -15,
             12,  15,
            -12,  15
        );
        this.p5.pop();
    }

    moveFwd(distance: number) {
        this.glidePos.set(
            this.position.x + Math.cos(this.heading) * distance,
            this.position.y + Math.sin(this.heading) * distance
        );

        if (this.glideSpeed <= 0) {
            this.position.set(this.glidePos);
        }
        else {
            this.gliding_ = true;
        }
    }

    get gliding() { return this.gliding_; }
}