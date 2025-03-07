import { TurtCallable } from "./callable";

/**
 * Union for all types that can be stored in a variable.
 */
export type LiteralTypeUnion = number|string|boolean|TurtCallable|null;

export enum TokenType {
    // single-character tokens
    LEFT_PAREN = "LEFT_PAREN",
    RIGHT_PAREN = "RIGHT_PAREN",
    LEFT_BRACE = "LEFT_BRACE",
    RIGHT_BRACE = "RIGHT_BRACE",
    COMMA = "COMMA",
    DOT = "DOT",
    MINUS = "MINUS",
    PLUS = "PLUS",
    SEMICOLON = "SEMICOLON",
    SLASH = "SLASH",
    STAR = "STAR",

    // one- or two-character tokens
    NOT = "NOT",
    NOT_EQUAL = "NOT_EQUAL",
    EQUAL = "EQUAL",
    DOUBLE_EQUAL = "DOUBLE_EQUAL",
    GREATER = "GREATER",
    GREATER_EQUAL = "GREATER_EQUAL",
    LESS = "LESS",
    LESS_EQUAL = "LESS_EQUAL",

    // literals
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",

    // keywords
    AND = "AND",
    ELSE = "ELSE",
    FALSE = "FALSE",
    FUNCDEF = "FUNCDEF",
    FOR = "FOR",
    IF = "IF",
    NULL = "NULL",
    OR = "OR",
    RETURN = "RETURN",
    TRUE = "TRUE",
    VAR = "VAR",
    WHILE = "WHILE",
    
    EOF = "EOF" // end of file
}

const KEYWORDS: {[key: string]: TokenType} = {
    "and":      TokenType.AND,
    "else":     TokenType.ELSE,
    "false":    TokenType.FALSE,
    "function": TokenType.FUNCDEF,
    "for":      TokenType.FOR,
    "if":       TokenType.IF,
    "null":     TokenType.NULL,
    "or":       TokenType.OR,
    "return":   TokenType.RETURN,
    "true":     TokenType.TRUE,
    "var":      TokenType.VAR,
    "while":    TokenType.WHILE,
};

/**
 * A single parseable token.
 */
export class Token {
    type: TokenType;
    lexeme: string;
    literal: LiteralTypeUnion;
    line: number; // which line the token is on

    constructor(type: TokenType, lexeme: string, literal: LiteralTypeUnion, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}

/**
 * Converts a raw code string into an array of tokens.
 */
export default class Scanner {
    private tokens: Token[] = [];
    private source: string; // code being scanned
    private start: number = 0; // first character in the current lexeme
    private current: number = 0; // character currently being scanned
    private line: number = 1; // current line number

    // whether one or more errors occurred while scanning
    hadError: boolean = false;

    constructor(source: string) {
        this.source = source;
    }

    /**
     * Prints an error message.
     */
    private error(message: string) {
        console.error(`[Turtle] Fatal Error (line ${this.line}): ${message}`);
        this.hadError = true;
    }

    // returns whether all character have been consumed
    private atEof(): boolean {
        return this.current >= this.source.length;
    }

    /**
     * "Pops" the next character off the front of the source string.
     */
    private advance(): string {
        return this.source[this.current++];
    }

    /**
     * Returns the next character on the source string without consuming it.
     */
    private peek(): string {
        if (this.atEof()) { return ""; }
        return this.source[this.current];
    }

    /**
     * Returns the character ahead of the next one.
     */
    private peekNext(): string {
        if (this.current + 1 >= this.source.length) { return ""; }
        return this.source[this.current + 1];
    }

    /**
     * Adds a single token.
     */
    private addToken(type: TokenType, literal: LiteralTypeUnion=null) {
        const tokenText = this.source.slice(this.start, this.current);
        this.tokens.push(new Token(type, tokenText, literal, this.line));
    }

    // used for finding two-character operators
    private match(expected: string) {
        if (this.atEof()) { return false; }
        if (this.source[this.current] === expected) {
            // only move to the next character if we have a match (if it doesn't, we still need to
            // parse it as part of the next token)
            ++this.current;
            return true;
        }
        return false;
    }

    // character type checking
    private isDigit(char: string): boolean {
        // you will never convince me that regex isn't just a set of arcane runes we pulled out of a
        // cursed temple in the 60s
        return /^\d+$/.test(char);
    }
    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }
    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

    /**
     * Scans a single token.
     */
    private scanToken() {
        const char = this.advance();
        switch (char) {
            // handle single-character tokens
            case "(": this.addToken(TokenType.LEFT_PAREN); break;
            case ")": this.addToken(TokenType.RIGHT_PAREN); break;
            case "{": this.addToken(TokenType.LEFT_BRACE); break;
            case "}": this.addToken(TokenType.RIGHT_BRACE); break;
            case ",": this.addToken(TokenType.COMMA); break;
            case ".": this.addToken(TokenType.DOT); break;
            case "-": this.addToken(TokenType.MINUS); break;
            case "+": this.addToken(TokenType.PLUS); break;
            case ";": this.addToken(TokenType.SEMICOLON); break;
            case "*": this.addToken(TokenType.STAR); break;
            case "/": this.addToken(TokenType.SLASH); break;

            // handle tokens that can be one or two characters
            case "!":
                this.addToken(this.match("=") ? TokenType.NOT_EQUAL : TokenType.NOT);
                break;
            case "=":
                this.addToken(this.match("=") ? TokenType.DOUBLE_EQUAL : TokenType.EQUAL);
                break;
            case "<":
                this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case ">":
                this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;

            // for a comment, consume everything until we hit the end of the line
            case "#":
                while(this.peek() !== "\n" && !this.atEof()) { this.advance(); }
                break;

            // whitespace and line breaks
            case " ": case "\r": case "\t": break;
            case "\n": ++this.line; break;

            // strings
            case '"': this.parseString(); break;

            default:
                // numbers can't be a case
                if (this.isDigit(char)) {
                    this.parseNumber();
                }
                else if (this.isAlpha(char)) {
                    this.parseIdentifier();
                }
                else {
                    this.error(`Unexpected character "${char}".`);
                }
        }
    }

    /**
     * Parses a string token.
     */
    private parseString() {
        // run until we hit the end of the string or the end of the input
        while (this.peek() !== '"' && !this.atEof()) {
            if (this.peek() === "\n") { ++this.line; }
            this.advance();
        }

        // throw an error if the string is never closed
        if (this.atEof()) {
            this.error("Unclosed string.");
        }

        // consume the closing quote
        this.advance();
        
        // trim the surrounding quotes off of the literal
        this.addToken(TokenType.STRING, this.source.slice(this.start + 1, this.current - 1));
    }

    /**
     * Parses a number token.
     */
    private parseNumber() {
        // advance until the end of the number
        while (this.isDigit(this.peek())) { this.advance(); }

        // check if there's a decimal point and that the number continues after it
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            // consume the decimal and the other half of the number
            this.advance();
            while (this.isDigit(this.peek())) { this.advance(); } 
        }

        this.addToken(
            TokenType.NUMBER, Number.parseFloat(this.source.slice(this.start, this.current))
        );
    }

    /**
     * Parses an identifier or keyword token.
     */
    private parseIdentifier() {
        // parse until we hit the end of the identifier
        while (this.isAlphaNumeric(this.peek())) { this.advance(); }

        // check if the identifier matches any keywords
        const id = this.source.slice(this.start, this.current);
        if (KEYWORDS[id]) {
            this.addToken(KEYWORDS[id]);
        }
        else {
            this.addToken(TokenType.IDENTIFIER);
        }
    }

    /**
     * Scans all tokens.
     */
    scan(): Token[] {
        while (!this.atEof()) {
            // reset to the start of the next lexeme
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line)); // cap off the end
        return this.tokens;
    }
}