import { TurtStdFunction } from "./callable.js";
import { TRuntimeError } from "./common.js";
import { LiteralTypeUnion, Token } from "./scanner.js";

/**
 * Runtime environment that stores all variables in a scope
 */
export default class Environment {
    private variables: { [key: string]: LiteralTypeUnion } = {};
    // global scope; used for preventing library functions from being redefined
    private globals: Environment;
    enclosing: Environment;
    index: number; // for debugging

    constructor();
    constructor(enclosing: Environment, globals: Environment);
    constructor(enclosing: Environment=null, globals: Environment=null) {
        this.enclosing = enclosing;
        this.globals = globals;
        if (enclosing) { this.index = enclosing.index + 1 }
        else { this.index = 0; }
        // console.log(`created environment ${this.index}`);
    }

    define(name: string, value: LiteralTypeUnion) {
        // console.log(`defining ${name} in environment ${this.index}`);

        // library functions can't be redefined in *any* scope
        if (this.globals !== null && this.globals.variables[name] instanceof TurtStdFunction) {
            throw new TRuntimeError(`'${name}' is a builtin function and cannot be redefined.`);
        }
        // nothing can be redefined in the same scope
        if (this.variables[name] !== undefined) {
            if (this.variables[name] instanceof TurtStdFunction) {
                throw new TRuntimeError(`'${name}' is a builtin function and cannot be redefined.`);
            }
            throw new TRuntimeError(`Variable '${name}' is already defined.`);
        }
        this.variables[name] = value;
    }

    assign(name: Token, value: LiteralTypeUnion) {
        // console.log(`assigning to ${name} in environment ${this.index}`);

        // libary functions can't be reassigned
        if (this.globals !== null &&
            this.globals.variables[name.lexeme] instanceof TurtStdFunction) {
            throw new TRuntimeError(
                `'${name.lexeme}' is a builtin function and cannot be reassigned.`
            );
        }
        if (this.variables[name.lexeme] instanceof TurtStdFunction) {
            throw new TRuntimeError(
                `'${name.lexeme}' is a builtin function and cannot be redefined.`
            );
        }
        if (this.variables[name.lexeme] !== undefined) {
            this.variables[name.lexeme] = value;
        }
        // if the variable isn't found and we're not in global scope, step back up the chain and try
        // to find it there
        else if (this.enclosing !== null) {
            this.enclosing.assign(name, value);
        }
        else {
            throw new TRuntimeError(`Undefined variable '${name.lexeme}'.`);
        }
    }

    get(name: Token): LiteralTypeUnion {
        // console.log(`getting ${name.lexeme} from environment ${this.index}`);
        if (this.variables[name.lexeme] !== undefined) {
            return this.variables[name.lexeme];
        }

        // if the variable isn't found and we're not in global scope, step back up the chain and try
        // to find it there
        if (this.enclosing !== null) { return this.enclosing.get(name); }

        throw new TRuntimeError(`Undefined variable '${name.lexeme}'.`);
    }
}