import { LiteralTypeUnion, Token } from "./scanner";

/**
 * Runtime environment that stores variables and all that.
 */
export default class Environment {
    private variables: { [key: string]: LiteralTypeUnion } = {};

    define(name: string, value: LiteralTypeUnion) {
        this.variables[name] = value;
    }

    get(name: Token) {
        
    }
}