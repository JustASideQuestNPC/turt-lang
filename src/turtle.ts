// import * as p5 from "p5";

import { TRuntimeError } from "./interpreter/common.js";
import Interpreter from "./interpreter/interpreter.js";

// object types for everything drawn onscreen
interface Line {
    type: "line", // used for distinguishing between shape types
    thickness: number,
    color: p5.Color,
    start: p5.Vector,
    end: p5.Vector
}
interface Polygon {
    type: "polygon", // used for distinguishing between shape types
    color: p5.Color,
    vertices: p5.Vector[];
}
type ShapeUnion = Line|Polygon;

function drawShape(p5: p5, shape: ShapeUnion) {
    switch (shape.type) {
        case "line":
            p5.stroke(shape.color);
            p5.strokeWeight(shape.thickness);
            p5.line(shape.start.x, shape.start.y, shape.end.x, shape.end.y);
            break;
        case "polygon":
            p5.noStroke();
            p5.fill(shape.color);
            p5.beginShape();
            for (const v of shape.vertices) {
                p5.vertex(v.x, v.y);
            }
            p5.endShape("close");
            break;
    }
}

/**
 * Onscreen turtle controlled by Turt code.
 */
export default class Turtle {
    position: p5.Vector;
    heading: number;
    drawing: boolean;
    hideSprite: boolean;
    lineThickness: number;
    private currentColor: p5.Color;

    private p5: p5;
    private glideSpeed: number;
    private gliding_: boolean;
    private glidePos: p5.Vector;
    private drawnShapes: ShapeUnion[];
    private currentShape: ShapeUnion;
    private drawingPolygon: boolean;

    parentInterpreter: Interpreter;

    constructor(p5: p5, glideSpeed: number) {
        this.p5 = p5;
        this.glideSpeed = glideSpeed;
        this.glidePos = this.p5.createVector();
        this.reset();
    }

    reset() {
        this.position = this.p5.createVector(this.p5.width / 2, this.p5.height / 2);
        this.heading = -Math.PI / 2;
        this.drawing = true;
        this.hideSprite = false;
        this.gliding_ = false;
        this.currentColor = this.p5.color(0);
        this.drawnShapes = [];
        this.currentShape = null;
        this.lineThickness = 2;
        this.drawingPolygon = false;
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
                
                if (this.currentShape) {
                    switch (this.currentShape.type) {
                        case "line":
                            this.currentShape.end.set(this.position);
                            break;
                        case "polygon":
                            break;
                    }

                    if (this.currentShape.type !== "polygon") {
                        this.drawnShapes.push(this.currentShape);
                    }
                }

                this.gliding_ = false;
                this.parentInterpreter.resumeGlide();
            }
            else {
                const moveAngle = this.glidePos.copy().sub(this.position).heading();
                this.position.add(
                    Math.cos(moveAngle) * moveDistance,
                    Math.sin(moveAngle) * moveDistance
                );
                // update shape positions for smooth drawing
                if (this.currentShape) {
                    switch (this.currentShape.type) {
                        case "line":
                            this.currentShape.end.set(this.position);
                            break;
                        case "polygon":
                            break;
                    }
                }
            }
        }
    }

    /**
     * Draws the turtle and everything that has been drawn to the canvas.
     */
    render() {
        for (const shape of this.drawnShapes) {
            drawShape(this.p5, shape);
        }
        // this is only used while gliding
        if (this.currentShape) { drawShape(this.p5, this.currentShape); }

        // draw the turtle's sprite (if shown)
        if (this.hideSprite) { return; }

        this.p5.stroke("#000000");
        this.p5.strokeWeight(2);
        this.p5.fill("#ffffff");

        this.p5.push();
        // console.log(`(${this.position.x}, ${this.position.y})`);
        this.p5.translate(this.position);
        this.p5.rotate(this.heading + Math.PI / 2);
        this.p5.triangle(
             0, -10,
             7,  10,
            -7,  10
        );
        this.p5.pop();
    }

    async moveFwd(distance: number) {
        this.glidePos.set(
            this.position.x + Math.cos(this.heading) * distance,
            this.position.y + Math.sin(this.heading) * distance
        );

        if (this.glideSpeed <= 0) {
            if (this.drawing && !this.drawingPolygon) {
                this.drawnShapes.push({
                    type: "line",
                    thickness: this.lineThickness,
                    color: this.currentColor,
                    start: this.position.copy(),
                    end: this.glidePos.copy()
                });
            }
            this.position.set(this.glidePos);
        }
        else {
            this.gliding_ = true;
            if (this.drawing && !this.drawingPolygon) {
                this.currentShape = {
                    type: "line",
                    thickness: this.lineThickness,
                    color: this.currentColor,
                    start: this.position.copy(),
                    end: this.position.copy()
                };
            }
        }
    }

    async setColor(r: number|string, g?: number, b?: number, a?: number) {
        if (this.drawingPolygon) { return; }

        // keeps typescript happy
        if (typeof r === "string") {
            this.currentColor = this.p5.color(r);
        }
        else {
            this.currentColor = this.p5.color(r, g, b, a);
        }
    }

    async penUp() {
        if (this.drawingPolygon) { return; }
        this.drawing = false;
    }

    async penDown() {
        if (this.drawingPolygon) { return; }
        this.drawing = true;
    }

    async beginPoly() {
        if (this.drawingPolygon || !this.drawing) { return; }

        // finish drawing a line
        if (this.currentShape) {
            this.drawnShapes.push(this.currentShape);
        }

        // place the first vertex at our position
        this.currentShape = {
            type: "polygon",
            color: this.currentColor,
            vertices: []
        };
        this.dropVertex();

        this.drawingPolygon = true;
    }
    
    async endPoly() {
        if (!this.drawingPolygon) { return; }

        // place a final endpoint where we end the shape
        this.dropVertex();
        this.drawnShapes.push(this.currentShape);
        this.currentShape = null;

        this.drawingPolygon = false;
    }

    async dropVertex() {
        if (!this.drawingPolygon) { return; }
        
        if (this.currentShape && this.currentShape.type === "polygon") {
            this.currentShape.vertices.push(this.position.copy());
        }
        else {
            throw new TRuntimeError("Cannot drop vertices in a non-polygon.");
        }
    }

    get gliding() { return this.gliding_; }
}