import Interpreter from "./interpreter";
import { LiteralTypeUnion } from "./scanner";

/**
 * Represents a callable Turt function.
 */
export class CallableBase {
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