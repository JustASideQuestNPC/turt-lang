import Turtle from "../turtle.js";
import { TurtStdFunction } from "./callable.js";
import Interpreter from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";

type ReturnType = LiteralTypeUnion|void
export type LibFunction = (
    (i: Interpreter, t: Turtle, ...args: LiteralTypeUnion[]) => ReturnType|Promise<ReturnType>
);

export interface TurtLibrary {
    functions: {[key: string]: LibFunction},
    variables: {[key: string]: LiteralTypeUnion}
}

/**
 * Imports a set of functions from a library.
 */
export default function importLibrary(interpreter: Interpreter,
                                      lib: TurtLibrary) {
    
    // convert functions to callable objects
    for (const [name, data] of Object.entries(lib.functions)) {
        // subtract 2 because the first parameter is the interpreter and the second is the turtle
        const numArgs = data.length - 2;
        interpreter.globals.define(name, new TurtStdFunction(name, numArgs, data), true);
    }

    // define variables
    for (const [name, value] of Object.entries(lib.variables)) {
        interpreter.globals.define(name, value, true);
    }
}