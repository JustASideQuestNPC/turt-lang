import EDITOR_CONFIG from "../../config/editorConfig.js";
import TextRenderer from "./text-renderer.js";

let sketch: p5;
let renderer: TextRenderer;
let charWidth: number;
let lineHeight: number;
let maxDisplayedLines: number;
let scrollLine: number;

namespace Editor {
    export function init(sketch_: p5) {
        sketch = sketch_;
        
        // hacky p5 to get text sizes
        sketch.push();
        sketch.textFont("monospace", EDITOR_CONFIG.TEXT_SIZE);
        charWidth = sketch.textWidth("#");
        lineHeight = sketch.textLeading() * 1.07;
        sketch.pop();
        
        renderer = new TextRenderer(sketch);
        maxDisplayedLines = Math.floor((sketch.width - 10) / lineHeight);
        scrollLine = 1;
    }

    export function loadText(text: string) {
        renderer.loadText(text);
    }

    export function update() {

    }

    export function render() {
        sketch.background(EDITOR_CONFIG.COLORS.BACKGROUND);

        // sidebar and line numbers
        sketch.noStroke();
        sketch.fill(EDITOR_CONFIG.COLORS.SIDEBAR);
        sketch.rect(0, 0, charWidth * 4 + 10, sketch.height);

        sketch.textFont("monospace", EDITOR_CONFIG.TEXT_SIZE);
        sketch.textAlign("right", "top");
        sketch.fill(EDITOR_CONFIG.COLORS.LINE_NUMBERS)
        
        let y = 5;
        for (
            let i = scrollLine;
            i <= maxDisplayedLines + scrollLine && i <= renderer.numLines();
            ++i
        ) {
            sketch.text(i, charWidth * 4 + 5, y);
            y += lineHeight;
        }

        // main code
        sketch.push();
        sketch.translate(charWidth * 4 + 20, 0);
        renderer.render(scrollLine);
        sketch.pop();
    }

    export function scroll(delta: number) {
        if (delta < 0 && scrollLine > 1) { --scrollLine };
        if (delta > 0 && scrollLine < renderer.numLines()) { ++scrollLine; }
    }
}
export default Editor;