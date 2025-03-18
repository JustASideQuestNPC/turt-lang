/**
 * Represents any error in Turt code that shouldn't crash the JS environment.
 */
export abstract class TurtError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Turt.TurtError";
    }
}

/**
 * Represents a syntax error found while parsing.
 */
export class TParseError extends TurtError {
    constructor(message: string) {
        super(message);
        this.name = "Turt.ParseError";
    }
}

/**
 * Represents an error caused when an array or string index is out of range.
 */
export class TRangeError extends TurtError {
    constructor(message: string) {
        super(message);
        this.name = "Turt.RangeError";
    }
}

/**
 * Represents a miscellaneous error caused when running Turt code.
 */
export class TRuntimeError extends TurtError {
    constructor(message: string) {
        super(message);
        this.name = "Turt.RuntimeError";
    }
}

/**
 * Represents an error caused when a value is of the wrong type.
 */
export class TTypeError extends TurtError {
    constructor(message: string) {
        super(message);
        this.name = "Turt.TypeError";
    }
}

/**
 * Represents an error caused when a while loop is considered infinite.
 */
export class TInfiniteLoopError extends TurtError {
    constructor(message: string) {
        super(message);
        this.name = "Turt.InfiniteLoopError";
    }
}