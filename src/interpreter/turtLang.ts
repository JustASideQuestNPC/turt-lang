import Turtle from "../turtle.js";
import Interpreter from "./interpreter.js";
import Parser from "./parser.js";
import Scanner from "./scanner.js";

let interpreter: Interpreter;
let codeLoaded: boolean = false;

namespace TurtLang {
    export function loaded() { return codeLoaded; }

    export function init(turtle: Turtle) {
        interpreter = new Interpreter(turtle);
    }

    /**
     * (Attempts to) compile some source code.
     * @return Whether the code was successfully compiled.
     */
    // technically Turt isn't compiled, but this is still the best name
    export function compile(source: string): boolean {
        codeLoaded = false;
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const parser = new Parser(tokens);

        const statements = parser.parse();
        if (parser.parseFailed) { return false; }

        interpreter.init(statements);
        codeLoaded = true;
        return true;
    }

    export async function run() {
        await interpreter.run();
    }

    export function finished(): boolean {
        return interpreter.finished;
    }

    export function turtleGliding(): boolean {
        return interpreter.turtle.gliding;
    }
}
export default TurtLang;