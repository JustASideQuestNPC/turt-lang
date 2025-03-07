import Environment from "./environment.js";
import Interpreter from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";
import { FunctionStmt } from "./statements.js";

export interface TurtCallable {
    numArgs: number;
    call: (interpreter: Interpreter, args: LiteralTypeUnion[]) => LiteralTypeUnion;
}

/**
 * Represents a function in the Turt standard library.
 */
export class TurtStdFunction implements TurtCallable {
    private name: string;
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
export class TurtUserFunction implements TurtCallable {
    private declaration: FunctionStmt;
    numArgs: number;

    constructor(declaration: FunctionStmt) {
        this.declaration = declaration;
        this.numArgs = declaration.params.length;
    }

    call(interpreter: Interpreter, args: LiteralTypeUnion[]): LiteralTypeUnion {
        // to include arguments, we just make a new environment and define them as variables
        const environment = new Environment(interpreter.globals);
        for (let i = 0; i < this.declaration.params.length; ++i) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }
        interpreter.executeBlock(this.declaration.body, environment);

        return null;
    }   

    toString(): string {
        return `<function ${this.declaration.name.lexeme}>`;
    }
}