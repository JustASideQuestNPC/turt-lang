import { BoundingBox } from "../common.js";

/**
 * Abstract base class for draggable code blocks.
 */
export default abstract class DraggableBase {
    private sketch: p5;
    dragHitbox: BoundingBox;

    constructor(sketch: p5) {
        this.sketch = sketch;
    }
}