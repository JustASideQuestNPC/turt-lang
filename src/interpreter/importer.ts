import { TurtStdFunction } from "./callable.js";
import Interpreter from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";

export type LibDataTypeUnion = (
    (interpreter: Interpreter, ...args: LiteralTypeUnion[]) => LiteralTypeUnion|void
);

/**
 * Imports a set of functions from a library.
 */
export default function importLibrary(interpreter: Interpreter,
                                      libData: {[key: string]: LibDataTypeUnion}) {
    for (const [name, data] of Object.entries(libData)) {
        // convert functions to callable objects
        // subtract 1 because the first parameter is the interpreter
        const numArgs = data.length - 1;
        interpreter.globals.define(name, new TurtStdFunction(name, numArgs, data));
    }
}