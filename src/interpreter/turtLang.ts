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

    /**
     * (Attempts to) compile some source code.
     * @return Whether the code was successfully compiled.
     */
    // technically Turt isn't compiled, but this is still the best name
    export function compile(source: string): boolean {
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const parser = new Parser(tokens);

        const statements = parser.parse();
        if (parser.parseFailed) { return false; }

        interpreter.init(statements);
        return true;
    }

    export function step() {
        interpreter.run();
    }

    export function run() {
        interpreter.run();
    }

    export function runUntilGlide() {
        interpreter.runUntilGlide();
    }

    export function finished(): boolean {
        return interpreter.finished;
    }

    export function turtleGliding(): boolean {
        return interpreter.turtle.gliding;
    }
}
export default TurtLang;