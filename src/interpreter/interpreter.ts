import { LiteralTypeUnion, Token, TokenType } from "./scanner.js";
import * as Expr from "./expressions.js";
import * as Stmt from "./statements.js";
import { TRuntimeError, TTypeError } from "./common.js";
import Environment from "./environment.js";
import { TurtStdFunction, TurtUserFunction } from "./callable.js";
import importLibrary from "./importer.js";
import turtStdLib from "./libraries/standard.js";

/**
 * Executes TurtLang code.
 */
export default class Interpreter implements Expr.ExprVisitor<LiteralTypeUnion>,
                                            Stmt.StmtVisitor<void> {
    globals: Environment; // this is public for importing libraries
    private environment: Environment;

    constructor() {
        this.globals = new Environment();
        // the standard library is always loaded
        importLibrary(this, turtStdLib); 

        this.environment = this.globals;
    }

    interpret(statements: Stmt.StmtBase[]) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        }
        catch (error) {
            console.error(error.message);
        }
    }

    visitAssignmentExpr(expr: Expr.AssignmentExpr): LiteralTypeUnion {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    }

    visitBinaryExpr(expr: Expr.BinaryExpr): LiteralTypeUnion {
        // cascade down the left and right sides and evaluate all of them first
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

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
    
    visitCallExpr(expr: Expr.CallExpr): LiteralTypeUnion {
        // make sure the callee is an identifier
        if (!(expr.callee instanceof Expr.VariableExpr)) {
            throw new TRuntimeError("Expected identifier before function call.");
        }
        // make sure the indentifier exists and maps to a function
        const callable = this.evaluate(expr.callee);
        if (!(callable instanceof TurtStdFunction || callable instanceof TurtUserFunction)) {
            throw new TTypeError(`'${expr.callee.name.lexeme}' is not a function.`);
        }

        // evaluate arguments in the order they were passed to the function - the order *probably*
        // won't ever be important, but it's useful just in case someone does something really weird
        const callArgs: LiteralTypeUnion[] = [];
        for (const arg of expr.args) {
            callArgs.push(this.evaluate(arg));
        }
        
        if (callArgs.length !== callable.numArgs) {
            throw new TRuntimeError(
                `Incorrect number of arguments for function '${expr.callee.name.lexeme}' ` +
                `(expected ${callable.numArgs}, recieved ${callArgs.length}).`
            );
        }

        return callable.call(this, callArgs);
    }
    
    visitGroupingExpr(expr: Expr.GroupingExpr): LiteralTypeUnion {
        return this.evaluate(expr.expression);
    }
    
    visitLiteralExpr(expr: Expr.LiteralExpr): LiteralTypeUnion {
        return expr.value;
    }
    
    visitLogicalExpr(expr: Expr.LogicalExpr): LiteralTypeUnion {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === TokenType.OR) {
            // short-circuit if the left side is true since the or will always be true then
            if (isTruthy(left)) { return left; }
        }
        else {
            // short-circuit if the left side is false since the or will always be false then
            if (!isTruthy(left)) { return left; }
        }

        // only evaluate the right side if we have to
        return this.evaluate(expr.right);
    }
    
    visitUnaryExpr(expr: Expr.UnaryExpr): LiteralTypeUnion {
        // cascade down the right side and evaluate everything else
        const right = this.evaluate(expr.right);
        
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
    
    visitVariableExpr(expr: Expr.VariableExpr): LiteralTypeUnion {
        return this.environment.get(expr.name);
    }

    private evaluate(expr: Expr.ExprBase): LiteralTypeUnion {
        return expr.accept(this);
    }

    visitBlockStmt(stmt: Stmt.BlockStmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
    }
    
    // this is public so functions can call it
    executeBlock(statements: Stmt.StmtBase[], environment: Environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            
            for (const statement of statements) {
                this.execute(statement);
            }
        }
        finally {
            this.environment = previous;
        }
    }

    visitExpressionStmt(stmt: Stmt.ExpressionStmt) {
        this.evaluate(stmt.expression);
    }

    visitFunctionStmt(stmt: Stmt.FunctionStmt) {
        this.environment.define(stmt.name.lexeme, new TurtUserFunction(stmt));
    }

    visitIfStmt(stmt: Stmt.IfStmt) {
        if (isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
    }

    visitReturnStmt(stmt: Stmt.ReturnStmt) {

    }

    visitVarStmt(stmt: Stmt.VarStmt) {
        let value: LiteralTypeUnion = null;
        // evaluate the initializer if it exists, otherwise set the variable to null
        if (stmt.initializer !== null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
    }

    visitWhileStmt(stmt: Stmt.WhileStmt) {
        while(isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
    }

    private execute(stmt: Stmt.StmtBase) {
        stmt.accept(this);
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
