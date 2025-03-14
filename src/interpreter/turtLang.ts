import Turtle from "../turtle.js";
import { TurtError } from "./common.js";
import Interpreter from "./interpreter.js";
import Parser from "./parser.js";
import Scanner from "./scanner.js";

let interpreter: Interpreter;

function run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scan();
    
    const parser = new Parser(tokens);
    try {
        const statements = parser.parse();
        interpreter.init(statements);
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

namespace TurtLang {
    export function init(turtle: Turtle) {
        interpreter = new Interpreter(turtle);
    }

    export function runLine(line: string) {
        run(line);
    }
}
export default TurtLang;