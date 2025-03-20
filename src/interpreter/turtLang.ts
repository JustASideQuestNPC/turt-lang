import Turtle from "../turtle.js";
import Interpreter from "./interpreter.js";
import Parser from "./parser.js";
import Scanner, { LiteralTypeUnion } from "./scanner.js";
import { StmtBase } from "./statements.js";

let interpreter: Interpreter;
let statements: StmtBase[];
let codeLoaded: boolean = false;

namespace TurtLang {
    export function loaded() { return codeLoaded; }

    export function init(turtle: Turtle) {
        interpreter = new Interpreter(turtle);
    }

    /**
     * (Attempts to) compile some source code. Optionally takes two callbacks that run on a success
     * and a failure respectively
     * @return Whether the code was successfully compiled.
     */
    // technically Turt isn't compiled, but this is still the best name
    export function compile(source: string, success?: ()=>void, failure?: ()=>void):boolean {
        codeLoaded = false;
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const parser = new Parser(tokens);

        statements = parser.parse();
        if (parser.parseFailed) {
            if (failure) { failure() }
            return false;
        }

        // this will get called again when we start running, but doing it here lets the statements
        // appear in the sidebar right away
        // interpreter.init(statements);
        codeLoaded = true;
        if (success) { success(); }
        return true;
    }

    export async function run() {
        interpreter.init(statements);
        await interpreter.run();
    }

    export function finished(): boolean {
        return interpreter.finished;
    }

    export function turtleGliding(): boolean {
        return interpreter.turtle.gliding;
    }

    export function killExecution() {
        interpreter.kill();
    }

    export function currentBlock(): [StmtBase[], number] {
        return interpreter.currentDisplayBlock;
    }

    export function getDebugVariableList(): {
        [key: string]: { value: LiteralTypeUnion, shadows: boolean } } {
        return interpreter.getDebugVariableList();
    }
}
export default TurtLang;