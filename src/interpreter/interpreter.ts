import { LiteralTypeUnion, Token, TokenType } from "./scanner.js";
import * as Expr from "./expressions.js";
import * as Stmt from "./statements.js";
import { TRangeError, TRuntimeError, TTypeError, TInfiniteLoopError } from "./common.js";
import Environment from "./environment.js";
import { TurtStdFunction, TurtUserFunction } from "./callable.js";
import importLibrary from "./importer.js";
import turtStdLib from "./libraries/standard.js";
import TurtArray from "./array.js";
import Turtle from "../turtle.js";
import turtDrawLib from "./libraries/draw.js";
import CONFIG from "../../config/_CONFIG.js";

/**
 * Dummy "error" used for returning from a function.
 */
export class ReturnInterrupt extends Error {
    value: LiteralTypeUnion;
    constructor(value: LiteralTypeUnion) {
        super();
        this.value = value;
    }
}

/**
 * Executes TurtLang code.
 */
export default class Interpreter implements Expr.ExprVisitor<Promise<LiteralTypeUnion>>,
                                            Stmt.StmtVisitor<void> {
    globals: Environment; // this is public for importing libraries
    private environment: Environment;
    private statements: Stmt.StmtBase[];
    private index: number;

    // for the sidebar
    private displayBlocks: [Stmt.StmtBase[], number][] = [];

    private hadError_: boolean;
    get hadError() { return this.hadError_; }

    private finished_: boolean;
    get finished() { return this.finished_; }

    // this is public so that the draw library can use it
    turtle: Turtle;
    resumeGlide: () => void; // will be called by the turtle

    private killExecution: boolean;;

    constructor(turtle: Turtle) {
        this.turtle = turtle;
        turtle.parentInterpreter = this;
        // starting with this true makes things easier elsewhere
        this.finished_ = true;
    }

    init(statements: Stmt.StmtBase[]) {
        this.globals = new Environment();
        this.environment = this.globals;
        this.statements = statements;
        this.index = 0;
        this.hadError_ = false;
        this.finished_ = false;
        this.killExecution = false;

        // for the sidebar
        this.displayBlocks = [[statements.slice(), 0]]

        // load standard libraries
        importLibrary(this, turtStdLib);
        importLibrary(this, turtDrawLib);

        // globals can't be defined as part of libraries
        this.globals.define("screenWidth", CONFIG.SCREEN_WIDTH);
        this.globals.define("screenHeight", CONFIG.SCREEN_HEIGHT);

        this.turtle.resetAll();
    }

    /** Runs all statements. */
    async run() {
        if (this.finished || this.hadError) { return; }

        console.log("running...");
        try {
            while (this.index < this.statements.length) {
                await this.execute(this.statements[this.index++]);
                if (this.hadError_) { break; }
            }
        }
        catch (error) {
            console.error(`[TurtLang] ${error.message}`);
            this.hadError_ = true;
        }

        this.finished_ = !this.hadError;
    }

    kill() {
        this.killExecution = true;
        this.turtle.gliding = false;
        this.finished_ = true;
    }

    async visitArrayExpr(expr: Expr.ArrayExpr): Promise<LiteralTypeUnion> {
        const literalItems: LiteralTypeUnion[] = [];
        for (const item of expr.items) {
            literalItems.push(await this.evaluate(item));
        }
        return new TurtArray(literalItems);
    }

    async visitAssignmentExpr(expr: Expr.AssignmentExpr): Promise<LiteralTypeUnion> {
        const value = await this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    }

    async visitBinaryExpr(expr: Expr.BinaryExpr): Promise<LiteralTypeUnion> {
        // cascade down the left and right sides and evaluate all of them first
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);

        switch (expr.operator.type) {
            // math operations
            case TokenType.PLUS:
                // the plus operator needs extra code because its overloaded for strings
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }

                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }
                
                throw new TTypeError(
                    `[TurtLang] TypeError (line ${expr.operator.line}): Operands must be two ` +
                    `numbers or two strings.`
                );
            case TokenType.MINUS:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case TokenType.STAR:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
            case TokenType.SLASH:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) / Number(right);
            case TokenType.MOD:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) % Number(right);
            case TokenType.DOUBLE_MOD:
                checkNumberOperands(expr.operator, left, right);
                const rem = Number(left) % Number(right);
                return rem >= 0 ? rem : rem + Number(right);

            // comparisons
            case TokenType.LESS:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case TokenType.LESS_EQUAL:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);
            case TokenType.GREATER:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case TokenType.GREATER_EQUAL:
                checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);

            // equality
            case TokenType.DOUBLE_EQUAL:
                return left === right;
            case TokenType.NOT_EQUAL:
                return left !== right;
        }

        // this *should* be unreachable
        return null;
    }
    
    async visitCallExpr(expr: Expr.CallExpr): Promise<LiteralTypeUnion> {
        // make sure the callee is an identifier
        if (!(expr.callee instanceof Expr.VariableExpr)) {
            throw new TRuntimeError("Expected identifier before function call.");
        }
        // make sure the indentifier exists and maps to a function
        const callee = await this.evaluate(expr.callee);
        if (!(callee instanceof TurtStdFunction || callee instanceof TurtUserFunction)) {
            throw new TTypeError(`'${expr.callee.name.lexeme}' is not a function.`);
        }

        // evaluate arguments in the order they were passed to the function - the order *probably*
        // won't ever be important, but it's useful just in case someone does something really weird
        const callArgs: LiteralTypeUnion[] = [];
        for (const arg of expr.args) {
            callArgs.push(await this.evaluate(arg));
        }
        
        if (callArgs.length !== callee.numArgs) {
            throw new TRuntimeError(
                `Incorrect number of arguments for function '${expr.callee.name.lexeme}' ` +
                `(expected ${callee.numArgs}, recieved ${callArgs.length}).`
            );
        }

        return await callee.call(this, callArgs);
    }
    
    async visitGroupingExpr(expr: Expr.GroupingExpr): Promise<LiteralTypeUnion> {
        return await this.evaluate(expr.expression);
    }

    async visitIndexExpr(expr: Expr.IndexExpr): Promise<LiteralTypeUnion> {
        // make sure the indexee is something that can be indexed
        if (!(expr.indexee instanceof Expr.VariableExpr ||
              expr.indexee instanceof Expr.LiteralExpr)) {
            throw new TRuntimeError("Expected identifier or string before indexer.");
        }
        const indexee = await this.evaluate(expr.indexee);
        if (!(typeof indexee === "string" || indexee instanceof TurtArray)) {
            throw new TTypeError("Only arrays and strings can be indexed.");
        }

        // indexes must be integer numbers
        const index = await this.evaluate(expr.index);
        if (typeof index !== "number" || index % 1 !== 0) {
            throw new TTypeError("Indexes must be integer numbers.");
        }

        // strings have to be manually indexed because wrapping them in a class wasn't worth it
        if (typeof indexee === "string") {
            if (index < -indexee.length || index >= indexee.length) {
                throw new TRangeError("String index out of range.");
            }

            // negative numbers index backward from the rear
            if (index < 0) {
                return indexee[indexee.length + index];
            }
            return indexee[index];
        }
        return indexee.get(index);
    }
    
    async visitLiteralExpr(expr: Expr.LiteralExpr): Promise<LiteralTypeUnion> {
        return expr.value;
    }
    
    async visitLogicalExpr(expr: Expr.LogicalExpr): Promise<LiteralTypeUnion> {
        const left = await this.evaluate(expr.left);

        if (expr.operator.type === TokenType.OR) {
            // short-circuit if the left side is true since the or will always be true then
            if (isTruthy(left)) { return left; }
        }
        else {
            // short-circuit if the left side is false since the or will always be false then
            if (!isTruthy(left)) { return left; }
        }

        // only evaluate the right side if we have to
        return await this.evaluate(expr.right);
    }
    
    async visitUnaryExpr(expr: Expr.UnaryExpr): Promise<LiteralTypeUnion> {
        // cascade down the right side and evaluate everything else
        const right = await this.evaluate(expr.right);
        
        switch (expr.operator.type) {
            // negation
            case TokenType.MINUS:
                checkNumberOperand(expr.operator, right);
                return -Number(right);
            // unary not
            case TokenType.NOT:
                return !isTruthy(right);
        }

        // this *should* be unreachable
        return null;
    }
    
    async visitVariableExpr(expr: Expr.VariableExpr): Promise<LiteralTypeUnion> {
        return this.environment.get(expr.name);
    }

    async evaluate(expr: Expr.ExprBase): Promise<LiteralTypeUnion> {
        return await expr.accept(this);
    }

    async visitBlockStmt(stmt: Stmt.BlockStmt) {
        await this.executeBlock(stmt.statements, new Environment(this.environment, this.globals));
    }
    
    // this is public so functions can call it
    async executeBlock(statements: Stmt.StmtBase[], environment: Environment) {
        // update the sidebar
        this.displayBlocks.push([statements.slice(), 0]);

        const previous = this.environment;
        try {
            this.environment = environment;
            
            for (let i = 0; i < statements.length; ++i) {
                this.displayBlocks[this.displayBlocks.length - 1][1] = i;
                await this.execute(statements[i]);
            }
        }
        finally {
            this.environment = previous;
            this.displayBlocks.pop();
        }
    }

    async visitExpressionStmt(stmt: Stmt.ExpressionStmt) {
        await this.evaluate(stmt.expression);
    }

    async visitFunctionStmt(stmt: Stmt.FunctionStmt) {
        this.environment.define(stmt.name.lexeme, new TurtUserFunction(stmt, this.environment));
    }

    async visitIfStmt(stmt: Stmt.IfStmt) {
        if (isTruthy(await this.evaluate(stmt.condition))) {
            await this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch !== null) {
            await this.execute(stmt.elseBranch);
        }
    }

    async visitReturnStmt(stmt: Stmt.ReturnStmt) {
        // the return value is optional
        let value = null;
        if (stmt.value !== null) {
            value = await this.evaluate(stmt.value);
        }

        // this is cursed and evil and i love it so much
        throw new ReturnInterrupt(value);
    }

    async visitVarStmt(stmt: Stmt.VarStmt) {
        let value: LiteralTypeUnion = null;
        // evaluate the initializer if it exists, otherwise set the variable to null
        if (stmt.initializer !== null) {
            value = await this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
    }

    async visitWhileStmt(stmt: Stmt.WhileStmt) {
        let numIterations = 0;
        while(isTruthy(await this.evaluate(stmt.condition))) {
            await this.execute(stmt.body);
            
            if (++numIterations >= CONFIG.MAX_LOOP_ITERATIONS) {
                throw new TInfiniteLoopError("Maximum number of loop iterations (250) exceeded.");
            }
        }
    }

    async execute(stmt: Stmt.StmtBase) {
        // immediately stop
        if (this.killExecution) { return; }

        if (this.turtle.gliding) {
            // console.log("pausing...");
            await new Promise((resolve) => {
                this.resumeGlide = () => {
                    resolve(null);
                };
            });
            // console.log("resuming...");
        }

        await stmt.accept(this);
    }

    get currentDisplayBlock() {
        return this.displayBlocks[this.displayBlocks.length - 1];
    }
}

function checkNumberOperand(operator: Token, operand: LiteralTypeUnion) {
    if (typeof operand !== "number") {
        throw new TTypeError(
            `[TurtLang] TypeError (line ${operator.line}): Operand must be a number.`
        );
    }
}

function checkNumberOperands(operator: Token, left: LiteralTypeUnion, right: LiteralTypeUnion) {
    if (typeof left !== "number" || typeof right !== "number") {
        throw new TTypeError(
            `[TurtLang] TypeError (line ${operator.line}): Operands must be numbers.`
        );
    }
}

/** Any value that isn't null, false, or 0 is truthy. */
function isTruthy(value: LiteralTypeUnion): boolean {
    return value !== null && value !== false && value !== 0;
}
