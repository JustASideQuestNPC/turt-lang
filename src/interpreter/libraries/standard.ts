import TurtArray from "../array.js";
import { TRuntimeError } from "../common.js";
import { LibFunction, TurtLibrary } from "../importer.js";
import { LiteralTypeUnion } from "../scanner.js";

/**
 * Functions for printing, math, and manipulating arrays.
 */
const functions: {[key: string]: LibFunction} = {
    // prints a message to the console
    "print": (i, t, message) => {
        console.log(`${message}`);
    },

    // pushes to the back of an array
    "pushBack": (i, t, array: TurtArray, value: LiteralTypeUnion): number => {
        if (array instanceof TurtArray) {
            array.pushBack(value);
            return array.size();
        }
        throw new TRuntimeError("pushBack() requires an array.");
    },
    
    // pops from the back of an array
    "popBack": (i, t, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popBack();
        }
        throw new TRuntimeError("popBack() requires an array.");
    },

    // pushes to the front of an array
    "pushFront": (i, t, array: TurtArray, value: LiteralTypeUnion): number => {
        if (array instanceof TurtArray) {
            array.pushFront(value);
            return array.size();
        }
        throw new TRuntimeError("pushFront() requires an array.");
    },
    
    // pops from the front of an array
    "popFront": (i, t, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popFront();
        }
        throw new TRuntimeError("popFront() requires an array.");
    },

    // returns the length of an array or string
    "length": (i, t, array: TurtArray|string): number => {
        if (array instanceof TurtArray) {
            return array.size();
        }
        else if (typeof array === "string") {
            return array.length;
        }
        throw new TRuntimeError("length() requires an array or string.");
    }
};

/**
 * Library variables; currently empty.
 */
const variables: {[key: string]: LiteralTypeUnion} = {};

const lib: TurtLibrary = {
    functions: functions,
    variables: variables
}
export default lib;