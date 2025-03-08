import { LibDataTypeUnion } from "../importer.js";

/**
 * The standard library contains functions for printing and drawing.
 */
const turtStdLib: {[key: string]: LibDataTypeUnion} = {
    // prints a message to the console
    "print": (_, message) => {
        console.log(message)
        return null;
    },

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

    // moves the turtle forward
    // returns the turtle's heading
    // sets the turtle's heading
    // hides the turtle's sprite
    // shows the turtle's sprite
    // disables drawing
    // enables drawing
};

export default turtStdLib;