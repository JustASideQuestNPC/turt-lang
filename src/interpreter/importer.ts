import Turtle from "../turtle.js";
import { TurtStdFunction } from "./callable.js";
import Interpreter from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";

export type LibDataTypeUnion = (
    (i: Interpreter, t: Turtle, ...args: LiteralTypeUnion[]) => LiteralTypeUnion|void
);

/**
 * Imports a set of functions from a library.
 */
export default function importLibrary(interpreter: Interpreter,
                                      libData: {[key: string]: LibDataTypeUnion}) {
    for (const [name, data] of Object.entries(libData)) {
        // convert functions to callable objects
        // subtract 2 because the first parameter is the interpreter and the second is the turtle
        const numArgs = data.length - 2;
        interpreter.globals.define(name, new TurtStdFunction(name, numArgs, data));
    }
}