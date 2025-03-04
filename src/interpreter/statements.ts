import { ExprBase } from "./expressions";
import { Token } from "./scanner";

// base class for statements
export abstract class StmtBase {
    abstract accept<T>(visitor: StmtVisitor<T>): T;
}

// visitor pattern base class
export interface StmtVisitor<T> {
    visitBlockStmt(stmt: BlockStmt): T;
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitFunctionStmt(stmt: FunctionStmt): T;
    visitIfStmt(stmt: IfStmt): T;
    visitPrintStmt(stmt: PrintStmt): T;
    visitReturnStmt(stmt: ReturnStmt): T;
    visitVarStmt(stmt: VarStmt): T;
    visitWhileStmt(stmt: WhileStmt): T;
}

class BlockStmt extends StmtBase {
    statements: StmtBase[];
    
    constructor(statements: StmtBase[]) {
        super();
        this.statements = statements;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

class ExpressionStmt extends StmtBase {
    expression: ExprBase;

    constructor(expression: ExprBase) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

class FunctionStmt extends StmtBase {
    name: Token;
    params: Token[];
    body: StmtBase[];

    constructor(name: Token, params: Token[], body: StmtBase[]) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitFunctionStmt(this);
    }
}

class IfStmt extends StmtBase {
    condition: ExprBase;
    thenBranch: StmtBase;
    elseBranch: StmtBase;

    constructor(condition: ExprBase, thenBranch: StmtBase, elseBranch: StmtBase) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitIfStmt(this);
    }
}

class PrintStmt extends StmtBase {
    expression: ExprBase;

    constructor(expression: ExprBase) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitPrintStmt(this);
    }
}

class ReturnStmt extends StmtBase {
    keyword: Token;
    value: ExprBase;

    constructor(keyword: Token, value: ExprBase) {
        super();
        this.keyword = keyword;
        this.value = value;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitReturnStmt(this);
    }
}

class VarStmt extends StmtBase {
    name: Token;
    initializer: ExprBase;

    constructor(name: Token, initializer: ExprBase) {
        super();
        this.name = name;
        this.initializer = initializer;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitVarStmt(this);
    }
}

class WhileStmt extends StmtBase {
    condition: ExprBase;
    body: StmtBase;

    constructor(condition: ExprBase, body: StmtBase) {
        super();
        this.condition = condition;
        this.body = body;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitWhileStmt(this);
    }
}