/**
 * The drawing library contains functions for controlling the onscreen turtle.
 */
import { LibDataTypeUnion } from "../importer.js";

function toRadians(angle: number) { return angle * (Math.PI / 180); }
function toDegrees(angle: number) { return angle * (180 / Math.PI); }

/**
 * The standard library contains functions for printing and drawing.
 */
const turtDrawLib: {[key: string]: LibDataTypeUnion} = {
    // returns the movement speed in pixels per second. 0 or below moves instantly
    "getMoveSpeed": (_, turtle) => {
        return turtle.glideSpeed;
    },

    // sets the movement speed in pixels per second. set to 0 or negative to move instantly
    "setMoveSpeed": (_, turtle, moveSpeed: number) => {
        turtle.glideSpeed = moveSpeed;
    },

    // resets everything
    "resetAll": (_, turtle) => {
        turtle.resetAll();
    },

    // resets the turtle's position and angle
    "goHome": (_, turtle) => {
        turtle.resetPosition();
    },

    // clears everything that has been drawn so far
    "clearCanvas": (_, turtle) => {
        turtle.resetDrawnShapes();
    },

    // resets color and line thickness
    "resetPen": (_, turtle) => {
        turtle.resetPen();
    },

    // returns the turtle's x position
    "getX": (_, turtle) => {
        return turtle.position.x;
    },

    // returns the turtle's y position
    "getY": (_, turtle) => {
        return turtle.position.y;
    },

    // sets the turtle's position
    "setPos": (_, turtle, x: number, y: number) => {
        turtle.position.set(x, y);
    },

    // moves the turtle forward or backward
    "moveFwd": async (_, turtle, distance: number) => {
        await turtle.moveFwd(distance);
    },

    // returns the turtle's heading in degrees
    "getAngle": (_, turtle) => {
        return toDegrees(turtle.heading + 90);
    },

    // sets the turtle's heading in degrees
    "setAngle": (_, turtle, angle: number) => {
        turtle.heading = toRadians(angle - 90);
    },

    // rotates the turtle by some amount of degrees
    "rotate": (_, turtle, angle: number) => {
        turtle.heading += toRadians(angle);
    },

    // hides the turtle's sprite
    "hideTurtle": (_, turtle) => {
        turtle.hideSprite = true;
    },

    // shows the turtle's sprite
    "showTurtle": (_, turtle) => {
        turtle.hideSprite = false;
    },

    // returns whether the turtle is hidden
    "isHidden": (_, turtle) => {
        return turtle.hideSprite;
    },

    // disables drawing
    "penUp": async (_, turtle) => {
        await turtle.penUp();
    },

    // enables drawing
    "penDown": async (_, turtle) => {
        await turtle.penDown();
    },

    // returns whether drawing is enabled
    "penIsDown": (_, turtle) => {
        return turtle.drawing;
    },

    // sets the draw color
    "setColor": async (_, turtle, r: number, g: number, b: number) => {
        await turtle.setColor(r, g, b);
    },

    // sets the line thickness
    "lineThickness": (_, turtle, value: number) => {
        turtle.lineThickness = value;
    },

    // begins drawing a polygon
    "beginPoly": async (_, turtle) => {
        await turtle.beginPoly();
    },

    // stops drawing a polygon
    "endPoly": async (_, turtle) => {
        await turtle.endPoly();
    },

    // drops a vertex in a polygon
    "dropVertex": async (_, turtle) => {
        await turtle.dropVertex();
    },
};

export default turtDrawLib;