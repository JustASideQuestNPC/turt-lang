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
    // resets everything
    "reset": (_, turtle) => {
        turtle.reset();
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
    "moveFwd": (_, turtle, distance: number) => {
        turtle.moveFwd(distance);
    },

    // returns the turtle's heading in degrees
    "getAngle": (_, turtle): number => {
        return toDegrees(turtle.heading);
    },

    // sets the turtle's heading in degrees
    "setAngle": (_, turtle, angle: number) => {
        turtle.heading = toRadians(angle);
    },

    // rotates the turtle by some amount of degrees
    "rotate":  (_, turtle, angle: number) => {
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
    "isHidden": (_, turtle): boolean => {
        return turtle.hideSprite;
    },

    // disables drawing
    "penUp": (_, turtle) => {
        turtle.drawing = false;
    },

    // enables drawing
    "penDown": (_, turtle) => {
        turtle.drawing = true;
    },

    // returns whether drawing is enabled
    "penIsDown": (_, turtle): boolean => {
        return turtle.drawing;
    },

    // sets the draw color
    "setColor": (_, turtle, r: number, g: number, b: number) => {
        turtle.setColor(r, g, b);
    }
};

export default turtDrawLib;