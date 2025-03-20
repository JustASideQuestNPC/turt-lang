/**
 * The drawing library contains functions for controlling the onscreen turtle.
 */
import { LibFunction, TurtLibrary } from "../importer.js";
import { LiteralTypeUnion } from "../scanner.js";


function toRadians(angle: number) { return angle * (Math.PI / 180); }
function toDegrees(angle: number) { return angle * (180 / Math.PI); }
const TWO_PI = Math.PI * 2;

/**
 * Functions for controlling the turtle.
 */
const functions: {[key: string]: LibFunction} = {
    // returns the movement speed in pixels per second. 0 or below moves instantly
    "getMoveSpeed": (_, turtle) => turtle.glideSpeed,

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
    "getX": (_, turtle) => turtle.position.x,

    // returns the turtle's y position
    "getY": (_, turtle) => turtle.position.y,

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
        turtle.heading = ((turtle.heading % TWO_PI) + TWO_PI) % TWO_PI;
    },

    // rotates the turtle by some amount of degrees
    "rotate": (_, turtle, angle: number) => {
        turtle.heading += toRadians(angle);
        turtle.heading = ((turtle.heading % TWO_PI) + TWO_PI) % TWO_PI;
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
    "isHidden": (_, turtle) => turtle.hideSprite,

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

    // sets the draw color using an index in the base color array
    "setColor": async (_, turtle, c: number) => {
        await turtle.setColor(c);
    },

    // sets the draw color using 3 RGBA numbers
    "setColorRgb": async (_, turtle, r: number, g: number, b: number) => {
        await turtle.setColorRgb(r, g, b);
    },

    // sets the draw color using a css color string
    "setColorCss": async (_, turtle, c: number) => {
        await turtle.setColor(c);
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

/**
 * Library variables; mainly color names.
 */
const variables: {[key: string]: LiteralTypeUnion} = {
    COLOR_BLACK: 0,
    COLOR_GRAY: 1,
    COLOR_WHITE: 2,
    COLOR_RED: 3,
    COLOR_ORANGE: 4,
    COLOR_YELLOW: 5,
    COLOR_GREEN: 6,
    COLOR_CYAN: 7,
    COLOR_SKY: 8,
    COLOR_BLUE: 9,
    COLOR_PURPLE: 10,
    COLOR_PINK: 11
};

const lib: TurtLibrary = {
    functions: functions,
    variables: variables
}
export default lib;