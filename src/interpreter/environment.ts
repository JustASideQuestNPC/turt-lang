import { TRuntimeError } from "./common.js";
import { LiteralTypeUnion, Token } from "./scanner.js";

/**
 * Runtime environment that stores all variables in a scope
 */
export default class Environment {
    private variables: { [key: string]: LiteralTypeUnion } = {};
    enclosing: Environment;

    constructor(enclosing: Environment=null) {
        this.enclosing = enclosing;
    }

    define(name: string, value: LiteralTypeUnion) {
        this.variables[name] = value;
    }

    assign(name: Token, value: LiteralTypeUnion) {
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
        if (this.variables[name.lexeme] !== undefined) {
            return this.variables[name.lexeme];
        }

        // if the variable isn't found and we're not in global scope, step back up the chain and try
        // to find it there
        if (this.enclosing !== null) { return this.enclosing.get(name); }

        throw new TRuntimeError(`Undefined variable '${name.lexeme}'.`);
    }
}