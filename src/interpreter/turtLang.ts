import Interpreter from "./interpreter.js";
import Parser, { ParseError } from "./parser.js";
import Scanner from "./scanner.js";

const interpreter = new Interpreter;

function run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scan();
    
    const parser = new Parser(tokens);
    try {
        const expr = parser.parse();
        interpreter.interpret(expr)
    }
    catch (error) {
        if (error instanceof ParseError) {
            console.error(error.message);
        }
        else {
            throw error;
        }
    }
}

namespace TurtLang {
    export function runLine(line: string) {
        run(line);
    }
}
export default TurtLang;