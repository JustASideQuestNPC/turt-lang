import Turtle from "../turtle.js";
import Environment from "./environment.js";
import Interpreter, { ReturnInterrupt } from "./interpreter.js";
import { LiteralTypeUnion } from "./scanner.js";
import { FunctionStmt } from "./statements.js";

export interface TurtCallable {
    numArgs: number;
    call: (interpreter: Interpreter, args: LiteralTypeUnion[]) => Promise<LiteralTypeUnion>;
}
type ReturnType = LiteralTypeUnion|void
type TurtStdCallback = (
    (i: Interpreter, t: Turtle, ...args: LiteralTypeUnion[]) => ReturnType|Promise<ReturnType>
);

/**
 * Represents a function in the Turt standard library.
 */
export class TurtStdFunction implements TurtCallable {
    private name: string;
    numArgs: number;
    callback: TurtStdCallback;

    constructor(name: string, numArgs: number, callback: TurtStdCallback) {
        this.name = name;
        this.numArgs = numArgs;
        this.callback = callback;
    }

    async call(interpreter: Interpreter, args: LiteralTypeUnion[]) {
        const returnValue = await this.callback(interpreter, interpreter.turtle, ...args);
        if (returnValue === undefined) { return null; }
        return returnValue as LiteralTypeUnion;
    };

    toString(): string {
        return `<function ${this.name}>`;
    }
}

/**
 * Represents a user-defined Turt function.
 */
export class TurtUserFunction implements TurtCallable {
    private declaration: FunctionStmt;
    private closure: Environment;
    numArgs: number;

    constructor(declaration: FunctionStmt, closure: Environment) {
        this.declaration = declaration;
        this.closure = closure;
        this.numArgs = declaration.params.length;
    }

    async call(interpreter: Interpreter, args: LiteralTypeUnion[]) {
        // to include arguments, we just make a new environment and define them as variables
        const environment = new Environment(this.closure, interpreter.globals);
        for (let i = 0; i < this.declaration.params.length; ++i) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }
        
        // there's no actual error here, i'm just throwing a fake error if i need to return from a
        // function statement. i will be going to programmer hell when i die.
        try {
            await interpreter.executeBlock(this.declaration.body, environment);
        }
        catch (error) {
            if (error instanceof ReturnInterrupt) {
                return error.value;
            }
            // re-throw any real errors
            throw error;
        }

        return null;
    }   

    toString(): string {
        return `<function ${this.declaration.name.lexeme}>`;
    }
}