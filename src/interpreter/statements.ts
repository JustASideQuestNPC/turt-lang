import { ExprBase } from "./expressions";
import { Token } from "./scanner";

// base class for statements
export abstract class StmtBase {
    abstract displayName: string;
    abstract accept<T>(visitor: StmtVisitor<T>): T;
}

// visitor pattern base class
export interface StmtVisitor<T> {
    visitBlockStmt(stmt: BlockStmt): T;
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitFunctionStmt(stmt: FunctionStmt): T;
    visitIfStmt(stmt: IfStmt): T;
    visitReturnStmt(stmt: ReturnStmt): T;
    visitVarStmt(stmt: VarStmt): T;
    visitWhileStmt(stmt: WhileStmt): T;
}

export class BlockStmt extends StmtBase {
    displayName: string = "STMT_BLOCK"; 
    statements: StmtBase[];
    
    constructor(statements: StmtBase[]) {
        super();
        this.statements = statements;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

export class ExpressionStmt extends StmtBase {
    displayName: string = "STMT_EXPRESSION"; 
    expression: ExprBase;

    constructor(expression: ExprBase) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class FunctionStmt extends StmtBase {
    displayName: string = "STMT_FUNCTION"; 
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

export class IfStmt extends StmtBase {
    displayName: string = "STMT_IF"; 
    condition: ExprBase;
    thenBranch: StmtBase;
    elseBranch: StmtBase|null;

    constructor(condition: ExprBase, thenBranch: StmtBase, elseBranch: StmtBase|null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitIfStmt(this);
    }
}

export class ReturnStmt extends StmtBase {
    displayName: string = "STMT_RETURN"; 
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

export class VarStmt extends StmtBase {
    displayName: string = "STMT_VAR"; 
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

export class WhileStmt extends StmtBase {
    displayName: string = "STMT_WHILE"; 
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