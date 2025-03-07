import { TurtStdFunction } from "./callable.js";
import Interpreter from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";

export type LibDataTypeUnion = ( number|string|boolean|null|
    ((interpreter: Interpreter, ...args: LiteralTypeUnion[]) => LiteralTypeUnion)
);

/**
 * Imports a set of functions or variables from a library.
 */
export default function importLibrary(interpreter: Interpreter,
                                      libData: {[key: string]: LibDataTypeUnion}) {
    for (const [name, data] of Object.entries(libData)) {
        // convert functions to callable objects
        if (typeof data === "function") {
            // subtract 1 because the first parameter is the interpreter
            const numArgs = data.length - 1;
            interpreter.globals.define(name, new TurtStdFunction(name, numArgs, data));
        }
        else {
            interpreter.globals.define(name, data);
        }
    }
}