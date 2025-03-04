import { BinaryExpr, ExprBase, GroupingExpr, LiteralExpr, UnaryExpr } from "./expressions.js";
import { Token, TokenType } from "./scanner.js";

/**
 * Represents a syntax error found when parsing turtle code.
 */
export class ParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ParseError";
    }
}

/**
 * Reports a parsing error message to the user, then returns (but does not throw) a `ParseError`
 * representing it.
 */

function reportError(token: Token, message: string): ParseError {
    if (token.type === TokenType.EOF) {
        message = `[TurtLang] ParseError (line ${token.line} at end): ${message}`;
    }
    else {
        message = `[TurtLang] ParseError (line ${token.line} at '${token.lexeme}'): ${message}')`;
    }
    console.error(message);
    return new ParseError(message);
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

    parse() {
        try {
            return this.expression();
        }
        catch (error) {
            if (error instanceof ParseError) {
                return null;
            }
            throw error;
        }
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
     * the next token is returned. Otherwise, a `ParseError` is thrown.
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
    
    private expression(): ExprBase {
        return this.equality();
    }

    private equality(): ExprBase {
        let expr = this.comparison();

        // all equality expressions are either "x == y" or "x != y", so we keep consuming until we
        // find a token that isn't one of those operators
        while(this.match(TokenType.DOUBLE_EQUAL, TokenType.NOT_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): ExprBase {
        let expr = this.term();

        while(this.match(TokenType.LESS, TokenType.GREATER, TokenType.LESS_EQUAL,
                         TokenType.GREATER_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // addition and subraction
    private term(): ExprBase {
        let expr = this.factor();

        while(this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // multiplication and division
    private factor(): ExprBase {
        let expr = this.unary();

        while(this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    // not (!) and negation (-), which both only affect a single value
    private unary(): ExprBase {
        if (this.match(TokenType.MINUS, TokenType.NOT)) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpr(operator, right);
        }

        return this.primary();
    }

    // literals and parentheses
    private primary(): ExprBase {
        if (this.match(TokenType.TRUE))  { return new LiteralExpr(true); }
        if (this.match(TokenType.FALSE)) { return new LiteralExpr(false); }
        if (this.match(TokenType.NULL))  { return new LiteralExpr(null); }

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new LiteralExpr(this.previous().literal);
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            let expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
            return new GroupingExpr(expr);
        }

        throw reportError(this.peek(), "Expected an expression.")
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
                case TokenType.FUNC:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.WHILE:
                case TokenType.IF:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}