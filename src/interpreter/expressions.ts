import { LiteralTypeUnion, Token } from "./scanner.js";

// base class for expressions
export abstract class ExprBase {
    abstract accept<T>(visitor: ExprVisitor<T>): T;
}

// visitor pattern base class
export interface ExprVisitor<T> {
    visitAssignmentExpr(expr: AssignmentExpr): T;
    visitBinaryExpr(expr: BinaryExpr): T;
    visitCallExpr(expr: CallExpr): T;
    visitGroupingExpr(expr: GroupingExpr): T;
    visitLiteralExpr(expr: LiteralExpr): T;
    visitLogicalExpr(expr: LogicalExpr): T;
    visitUnaryExpr(expr: UnaryExpr): T;
    visitVariableExpr(expr: VariableExpr): T;
}

/**
 * A variable assignment.
 */
export class AssignmentExpr extends ExprBase {
    name: Token;
    value: ExprBase;

    constructor(name: Token, value: ExprBase) {
        super();
        this.name = name;
        this.value = value;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitAssignmentExpr(this);
    }
}

/**
 * A binary operator.
 */
export class BinaryExpr extends ExprBase {
    left: ExprBase;
    right: ExprBase;
    operator: Token;

    constructor(left: ExprBase, operator: Token, right: ExprBase) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

/**
 * A function call.
 */
export class CallExpr extends ExprBase {
    callee: ExprBase;
    paren: Token;
    args: ExprBase[];

    constructor(callee: ExprBase, paren: Token, args: ExprBase[]) {
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitCallExpr(this);
    }
}

/**
 * An expression grouped in parentheses.
 */
export class GroupingExpr extends ExprBase {
    expression: ExprBase;

    constructor(expression: ExprBase) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGroupingExpr(this);
    }
}

/**
 * A literal value (string, number, boolean, null).
 */
export class LiteralExpr extends ExprBase {
    value: LiteralTypeUnion;

    constructor(value: LiteralTypeUnion) {
        super();
        this.value = value;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLiteralExpr(this);
    }
}

/**
 * An `and` or `or` operator.
 */
export class LogicalExpr extends ExprBase {
    left: ExprBase;
    operator: Token;
    right: ExprBase;

    constructor(left: ExprBase, operator: Token, right: ExprBase) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLogicalExpr(this);
    }
}

/**
 * A `!` (not) or `-` (negation) operator.
 */
export class UnaryExpr extends ExprBase {
    operator: Token;
    right: ExprBase;

    constructor(operator: Token, right: ExprBase) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitUnaryExpr(this);
    }
}

/**
 * A variable access expression.
 */
export class VariableExpr extends ExprBase {
    name: Token;

    constructor(name: Token) {
        super();
        this.name = name;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVariableExpr(this);
    }
}