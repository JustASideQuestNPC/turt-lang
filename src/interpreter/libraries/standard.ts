import TurtArray from "../array.js";
import { TTypeError } from "../common.js";
import { LibFunction, TurtLibrary } from "../importer.js";
import { LiteralTypeUnion } from "../scanner.js";

function degToRad(angle: number): number {
    return angle * Math.PI / 180;
}

function radToDeg(angle: number): number {
    return angle * 180 / Math.PI;
}

function mapValue(n: number, s1: number, e1: number, s2: number, e2: number): number {
    return e2 + ((e2 - s2) / (e1 - s1)) * (n - s1);
}

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
        throw new TTypeError("pushBack() requires an array.");
    },
    
    // pops from the back of an array
    "popBack": (i, t, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popBack();
        }
        throw new TTypeError("popBack() requires an array.");
    },

    // pushes to the front of an array
    "pushFront": (i, t, array: TurtArray, value: LiteralTypeUnion): number => {
        if (array instanceof TurtArray) {
            array.pushFront(value);
            return array.size();
        }
        throw new TTypeError("pushFront() requires an array.");
    },
    
    // pops from the front of an array
    "popFront": (i, t, array: TurtArray): LiteralTypeUnion => {
        if (array instanceof TurtArray) {
            return array.popFront();
        }
        throw new TTypeError("popFront() requires an array.");
    },

    // returns the length of an array or string
    "length": (i, t, array: TurtArray|string): number => {
        if (array instanceof TurtArray) {
            return array.size();
        }
        else if (typeof array === "string") {
            return array.length;
        }
        throw new TTypeError("length() requires an array or string.");
    },

    // copies an array
    "copy": (i, t, array: TurtArray|string): TurtArray => {
        if (array instanceof TurtArray) {
            const copied: LiteralTypeUnion[] = [];
            for (let i = 0; i < array.size(); ++i) {
                copied.push(array.get(i));
            }
            return new TurtArray(copied);
        }
        throw new TTypeError("copy() requires an array.");
    },

    // converts an angle from degrees to radians
    "degToRad": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return degToRad(angle);
        }
        throw new TTypeError("degToRad() requires a number.");
    },

    // converts an angle from radians to degrees
    "radToDeg": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return radToDeg(angle);
        }
        throw new TTypeError("radToDeg() requires a number.");
    },

    "sin": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return Math.sin(degToRad(angle));
        }
        throw new TTypeError("sin() requires a number.");
    },

    "cos": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return Math.cos(degToRad(angle));
        }
        throw new TTypeError("cos() requires a number.");
    },

    "tan": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return Math.tan(degToRad(angle));
        }
        throw new TTypeError("tan() requires a number.");
    },

    "exp": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return Math.exp(degToRad(angle));
        }
        throw new TTypeError("exp() requires a number.");
    },

    "sqrt": (i, t, angle: number): number => {
        if (typeof angle === "number") {
            return Math.sqrt(degToRad(angle));
        }
        throw new TTypeError("sqrt() requires a number.");
    },

    "map": (i, t, n: number, s1: number, e1: number, s2: number, e2: number): number => {
        if (typeof n === "number" && typeof s1 === "number" && typeof e1 === "number" &&
            typeof s2 === "number" && typeof e2 === "number") {
            return mapValue(n, s1, e1, s2, e2);
        }
        throw new TTypeError("map() requires 5 numbers.");
    },

    "lerp": (i, t, start: number, end: number, amount: number): number => {
        if (typeof start === "number" && typeof end === "number" && typeof amount === "number") {
            return mapValue(amount, 0, 1, start, end);
        }
        throw new TTypeError("lerp() requires 3 numbers.");
    },
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