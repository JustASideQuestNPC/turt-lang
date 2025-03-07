import { Token, TokenType } from "./scanner.js";
import * as Expr from "./expressions.js";
import * as Stmt from "./statements.js";
import { TParseError } from "./common.js";

/**
 * Reports a parsing error message to the user, then returns (but does not throw) a `TParseError`
 * representing it.
 */
function reportError(token: Token, message: string): TParseError {
    if (token.type === TokenType.EOF) {
        message = `[TurtLang] ParseError (line ${token.line} at end): ${message}`;
    }
    else {
        message = `[TurtLang] ParseError (line ${token.line} at '${token.lexeme}'): ${message}')`;
    }
    console.error(message);
    return new TParseError(message);
}

/**
 * Converts an array of tokens into a syntax tree, along with performing error checks.
 */
export default class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /**
     * Parses all tokens into a list of statements.
     */
    parse(): Stmt.StmtBase[] {
        const statements: Stmt.StmtBase[] = [];
        
        while (!this.atEof()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    private atEof(): boolean {
        return this.tokens[this.current].type === TokenType.EOF;
    }

    /**
     * Consumes and returns the current token.
     */
    private advance(): Token {
        if (!this.atEof()) { ++this.current; }
        return this.previous();
    }

    /**
     * Returns the current token without consuming it.
     */
    private peek(): Token {
        return this.tokens[this.current];
    }

    /**
     * Returns the previous token.
     */
    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    /**
     * Returns whether the current token is of the given type. Does not consume the current token.
     */
    private check(type: TokenType): boolean {
        if (this.atEof()) { return false; }
        return this.peek().type === type;
    }

    /**
     * Checks whether the current token is of the given type. If it is, the token is consumed and
     * the next token is returned. Otherwise, a `TParseError` is thrown.
     */
    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) { return this.advance(); }
        throw reportError(this.peek(), message);
    }

    /**
     * Returns whether the current token is of any of the given types. If true, the current token is
     * also consumed.
     */
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    private expression(): Expr.ExprBase {
        return this.assignment();
    }

    private equality(): Expr.ExprBase {
        let expr = this.comparison();

        // all equality expressions are either "x == y" or "x != y", so we keep consuming until we
        // find a token that isn't one of those operators
        while(this.match(TokenType.DOUBLE_EQUAL, TokenType.NOT_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new Expr.BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expr.ExprBase {
        let expr = this.term();

        while(this.match(TokenType.LESS, TokenType.GREATER, TokenType.LESS_EQUAL,
                         TokenType.GREATER_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new Expr.BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // addition and subraction
    private term(): Expr.ExprBase {
        let expr = this.factor();

        while(this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new Expr.BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // multiplication and division
    private factor(): Expr.ExprBase {
        let expr = this.unary();

        while(this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new Expr.BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // not (!) and negation (-), which both only affect a single value
    private unary(): Expr.ExprBase {
        if (this.match(TokenType.MINUS, TokenType.NOT)) {
            const operator = this.previous();
            const right = this.unary();
            return new Expr.UnaryExpr(operator, right);
        }

        return this.call();
    }

    // literals and parentheses
    private primary(): Expr.ExprBase {
        if (this.match(TokenType.TRUE))  { return new Expr.LiteralExpr(true); }
        if (this.match(TokenType.FALSE)) { return new Expr.LiteralExpr(false); }
        if (this.match(TokenType.NULL))  { return new Expr.LiteralExpr(null); }

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Expr.LiteralExpr(this.previous().literal);
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new Expr.VariableExpr(this.previous());
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            let expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
            return new Expr.GroupingExpr(expr);
        }

        throw reportError(this.peek(), "Expected an expression.")
    }

    // function calls
    private call(): Expr.ExprBase {
        let expr = this.primary();

        // loop this to handle chained function calls (i.e., "foo(1)(2)(3);")
        while (this.match(TokenType.LEFT_PAREN)) { expr = this.finishCall(expr); }

        return expr;
    }

    private finishCall(callee: Expr.ExprBase): Expr.CallExpr  {
        // loop through and get all the arguments (if any)
        const callArgs: Expr.ExprBase[] = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                callArgs.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        const paren = this.consume(TokenType.RIGHT_PAREN, "Expected ')' after argument list.");

        return new Expr.CallExpr(callee, paren, callArgs);
    }

    private assignment(): Expr.ExprBase {
        // check for boolean operators - if there aren't any, this will fall through and we'll get
        // an expression
        const expr = this.logical();

        // mildly cursed stuff to get around only having a 1-token lookahead
        if (this.match(TokenType.EQUAL)) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof Expr.VariableExpr) {
                const name = expr.name;
                return new Expr.AssignmentExpr(name, value);
            }

            reportError(equals, "Invalid assignment target");
        }

        return expr;
    }

    private logical(): Expr.ExprBase {
        let expr = this.equality();

        while (this.match(TokenType.AND, TokenType.OR)) {
            const operator = this.previous();
            const right = this.equality();
            expr = new Expr.LogicalExpr(expr, operator, right);
        }

        return expr;
    }

    /**
     * Attempts to synchronize the parser after a syntax error is found.
     */
    private synchronize() {
        this.advance();

        // step forward until we find the beginning of the next statement
        while (!this.atEof()) {
            if (this.previous().type === TokenType.SEMICOLON) { return; }

            switch(this.peek().type) {
                case TokenType.FUNCDEF:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.WHILE:
                case TokenType.IF:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }

    private declaration(): Stmt.StmtBase {
        // try...catch for synchronizing after a parse error
        try {
            if (this.match(TokenType.FUNCDEF)) { return this.functionStatement(); }
            if (this.match(TokenType.VAR))  { return this.varDeclaration(); }
            return this.statement();
        }
        catch (error) {
            if (error instanceof TParseError) {
                this.synchronize();
                return null;
            }
            // unexpected errors should still be thrown
            throw error;
        }
    }

    private statement(): Stmt.StmtBase {
        if (this.match(TokenType.FOR))        { return this.forStatement(); }
        if (this.match(TokenType.IF))         { return this.ifStatement(); }
        if (this.match(TokenType.WHILE))      { return this.whileStatement(); }
        if (this.match(TokenType.LEFT_BRACE)) { return new Stmt.BlockStmt(this.blockStatement()); }

        // if nothing matches, assume it's an expression statement
        return this.expressionStatement();
    }

    private expressionStatement(): Stmt.ExpressionStmt {
        const expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ';' after expression.");
        return new Stmt.ExpressionStmt(expr);
    }

    private varDeclaration(): Stmt.VarStmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name.");

        // initializers are optional
        let initializer: Expr.ExprBase = null;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expected ';' after declaration.");
        return new Stmt.VarStmt(name, initializer);
    }

    private blockStatement(): Stmt.StmtBase[] {
        const statements: Stmt.StmtBase[] = [];
        
        while (!this.check(TokenType.RIGHT_BRACE) && !this.atEof()) {
            statements.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block.");
        return statements;
    }

    private ifStatement(): Stmt.StmtBase {
        this.consume(TokenType.LEFT_PAREN, "Expected '{' after 'if'.");
        const condition = this.expression(); // the conditional
        this.consume(TokenType.RIGHT_PAREN, "Expected '}' after if condition.");

        // branch in braces
        const thenBranch = this.statement();
        // the else branch is optional
        let elseBranch: Stmt.StmtBase = null;
        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new Stmt.IfStmt(condition, thenBranch, elseBranch);
    }

    private whileStatement(): Stmt.StmtBase {
        this.consume(TokenType.LEFT_PAREN, "Expected '{' after 'while'.");
        const condition = this.expression(); // the conditional
        this.consume(TokenType.RIGHT_PAREN, "Expected '}' after while condition.");
        const body = this.statement();

        return new Stmt.WhileStmt(condition, body);
    }

    private forStatement(): Stmt.StmtBase {
        this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'for'.");

        // rather than add a new method to the interpreter, we can just unpack the for loop into a
        // while loop and use the while method again
        let initializer: Stmt.StmtBase;
        // the initializer is optional
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null;
        }
        else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclaration();
        }
        else {
            initializer = this.expressionStatement();
        }

        let condition: Expr.ExprBase = null;
        // the condition is also optional
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expected ';' after loop condition.");
        
        let increment: Expr.ExprBase = null;
        // the increment is ALSO optional
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(TokenType.RIGHT_PAREN, "Expected ')' after for loop clauses.");

        let body = this.statement();
        if (increment !== null) {
            body = new Stmt.BlockStmt([body, new Stmt.ExpressionStmt(increment)]);
        }

        // add some fallbacks and create the final while statement
        if (condition === null) { condition = new Expr.LiteralExpr(true); }
        body = new Stmt.WhileStmt(condition, body);
        if (initializer !== null) {
            body = new Stmt.BlockStmt([initializer, body]);
        }

        return body;
    }

    // function declarations
    private functionStatement(): Stmt.FunctionStmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expected function name.");
        this.consume(TokenType.LEFT_PAREN, "Expected '(' after function name.");
        
        // parameter list
        const params: Token[] = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameter list.");

        // function body
        this.consume(TokenType.LEFT_BRACE, "Expected '{' before function body.");
        const body = this.blockStatement();

        return new Stmt.FunctionStmt(name, params, body);
    }
}