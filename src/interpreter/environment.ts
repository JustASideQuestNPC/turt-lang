import { TRuntimeError } from "./common.js";
import { LiteralTypeUnion, Token } from "./scanner.js";

/**
 * Runtime environment that stores variables and all that.
 */
export default class Environment {
    private variables: { [key: string]: LiteralTypeUnion } = {};

    define(name: string, value: LiteralTypeUnion) {
        this.variables[name] = value;
    }

    assign(name: Token, value: LiteralTypeUnion) {
        if (this.variables[name.lexeme] !== undefined) {
            this.variables[name.lexeme] = value;
        }
        else {
            throw new TRuntimeError(`Undefined variable '${name.lexeme}'.`);
        }
    }

    get(name: Token): LiteralTypeUnion {
        if (this.variables[name.lexeme] !== undefined) {
            return this.variables[name.lexeme];
        }

        throw new TRuntimeError(`Undefined variable '${name.lexeme}'.`);
    }
}