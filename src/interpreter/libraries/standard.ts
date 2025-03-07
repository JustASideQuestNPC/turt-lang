import { LibDataTypeUnion } from "../importer.js";

/**
 * The standard library contains functions for printing and drawing.
 */
const turtStdLib: {[key: string]: LibDataTypeUnion} = {
    "printLog": (_, message) => {
        console.log(message)
        return null;
    }
};

export default turtStdLib;