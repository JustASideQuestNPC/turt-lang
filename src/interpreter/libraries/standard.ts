import { LibDataTypeUnion } from "../importer.js";

/**
 * The standard library contains functions for printing and manipulating arrays and strings.
 */
const turtStdLib: {[key: string]: LibDataTypeUnion} = {
    // prints a message to the console
    "print": (_, message) => {
        // why doesn't console.log() automatically call toString()???
        console.log(`${message}`);
        return null;
    },

    
};

export default turtStdLib;