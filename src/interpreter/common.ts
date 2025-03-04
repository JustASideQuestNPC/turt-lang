/**
 * Represents any error in Turt code that doesn't crash the JS environment. This is an abstract
 * class that only exists to make try-catch blocks simpler - do not instantiate it directly.
 */
export abstract class TurtError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Turt.TurtError";
    }
}

export class TParseError extends TurtError{
    constructor(message: string) {
        super(message);
        this.name = "Turt.ParseError";
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