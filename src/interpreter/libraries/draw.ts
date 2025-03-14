/**
 * The drawing library contains functions for controlling the onscreen turtle.
 */
import { LibDataTypeUnion } from "../importer.js";

/**
 * The standard library contains functions for printing and drawing.
 */
const turtDrawLib: {[key: string]: LibDataTypeUnion} = {
    // returns the turtle's x position
    "getX": (_) => {
        return null;
    },

    // returns the turtle's y position
    "getY": (_) => {
        return null;
    },

    // sets the turtle's position
    "setPos": (_, x: number, y: number) => {
        return null;
    },

    // moves the turtle forward or backward
    // returns the turtle's heading
    // sets the turtle's heading
    // hides the turtle's sprite
    // shows the turtle's sprite
    // disables drawing
    // enables drawing
    // sets the draw color
    
};

export default turtDrawLib;