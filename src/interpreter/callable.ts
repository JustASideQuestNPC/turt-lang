import Interpreter from "./interpreter";
import { LiteralTypeUnion } from "./scanner";

export interface TurtCallable {
    name: string;
    numArgs: number;
    call: (interpreter: Interpreter, args: LiteralTypeUnion[]) => LiteralTypeUnion;
    toString: () => string;
}

/**
 * Represents a function in the Turt standard library.
 */
export class TurtStdFunction implements TurtCallable {
    name: string;
    numArgs: number;
    call: (interpreter: Interpreter, args: LiteralTypeUnion[])=>LiteralTypeUnion;

    constructor(name: string, numArgs: number,
                call: (interpreter: Interpreter, args: LiteralTypeUnion[])=>LiteralTypeUnion) {
        this.name = name;
        this.numArgs = numArgs;
        this.call = call;
    }

    toString(): string {
        return `<function ${this.name}>`;
    }
}

/**
 * Represents a user-defined Turt function.
 */