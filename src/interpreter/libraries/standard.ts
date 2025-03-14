import TurtArray from "../array.js";
import { TRuntimeError } from "../common.js";
import { LibDataTypeUnion } from "../importer.js";
import { LiteralTypeUnion } from "../scanner.js";

/**
 * The standard library contains functions for printing and manipulating arrays and strings.
 */
const turtStdLib: {[key: string]: LibDataTypeUnion} = {
    // prints a message to the console
    "print": (_, message) => {
        console.log(`${message}`);
    },

    // pushes to the back of an array
    "pushBack": (_, array: TurtArray, value: LiteralTypeUnion): number => {
        if (array instanceof TurtArray) {
            array.pushBack(value);
            return array.size();
        }
        throw new TRuntimeError("pushBack() requires an array.");
    },
    
    // pops from the back of an array
    "popBack": (_, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popBack();
        }
        throw new TRuntimeError("pushBack() requires an array.");
    },

    // pushes to the front of an array
    "pushFront": (_, array: TurtArray, value: LiteralTypeUnion): number => {
        if (array instanceof TurtArray) {
            array.pushFront(value);
            return array.size();
        }
        throw new TRuntimeError("pushBack() requires an array.");
    },
    
    // pops from the front of an array
    "popFront": (_, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popFront();
        }
        throw new TRuntimeError("pushBack() requires an array.");
    },
};

export default turtStdLib;