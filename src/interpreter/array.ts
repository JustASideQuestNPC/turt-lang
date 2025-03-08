import { TRangeError } from "./common.js";
import { LiteralTypeUnion } from "./scanner.js";

export default class TurtArray {
    private items: LiteralTypeUnion[];
    
    constructor(items: LiteralTypeUnion[]) {
        this.items = items;
    }

    index(i: number): LiteralTypeUnion {
        if (i < -this.items.length || i >= this.items.length) {
            throw new TRangeError("Array index out of range.");
        }
        
        // negative numbers index from the rear
        if (i < 0) {
            return this.items[this.items.length + i];
        }
        return this.items[i];
    }

    toString(): string {
        return "[" + this.items.join(", ") + "]";
    }
}