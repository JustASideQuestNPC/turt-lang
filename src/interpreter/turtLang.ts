import Turtle from "../turtle.js";
import { TurtError } from "./common.js";
import Interpreter from "./interpreter.js";
import Parser from "./parser.js";
import Scanner from "./scanner.js";

let interpreter: Interpreter;

namespace TurtLang {
    export function init(turtle: Turtle) {
        interpreter = new Interpreter(turtle);
    }

    // technically Turt isn't compiled, but this is still the best name
    export function compile(source: string) {
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const parser = new Parser(tokens);
        try {
            const statements = parser.parse();
            interpreter.init(statements);
        }
        catch (error) {
            // this will catch any turt-related error (ParseError, RuntimeError, etc.)
            if (error instanceof TurtError) {
                console.error(error.message);
            }
            // throw anything we don't expect
            else {
                throw error;
            }
        }
    }

    export function step() {
        try {
            interpreter.run();
        }
        catch (error) {
            // this will catch any turt-related error (ParseError, RuntimeError, etc.)
            if (error instanceof TurtError) {
                console.error(error.message);
            }
            // throw anything we don't expect
            else {
                throw error;
            }
        }
    }

    export function run() {
        try {
            interpreter.run();
        }
        catch (error) {
            // this will catch any turt-related error (ParseError, RuntimeError, etc.)
            if (error instanceof TurtError) {
                console.error(error.message);
            }
            // throw anything we don't expect
            else {
                throw error;
            }
        }
    }

    export function runUntilGlide() {
        try {
            interpreter.runUntilGlide();
        }
        catch (error) {
            // this will catch any turt-related error (ParseError, RuntimeError, etc.)
            if (error instanceof TurtError) {
                console.error(error.message);
            }
            // throw anything we don't expect
            else {
                throw error;
            }
        }
    }

    export function finished(): boolean {
        return interpreter.finished;
    }

    export function turtleGliding(): boolean {
        return interpreter.turtle.gliding;
    }
}
export default TurtLang;