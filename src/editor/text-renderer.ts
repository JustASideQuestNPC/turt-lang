import EDITOR_CONFIG from "../../config/editorConfig.js";

interface TextChunk {
    text: string,
    color: string
}

export default class TextRenderer {
    private sketch: p5;
    private lines: TextChunk[][];
    private charWidth: number;
    private lineHeight: number;
    private maxDisplayedLines: number;

    constructor(sketch: p5) {
        this.sketch = sketch;

        // hacky p5 to get text sizes
        sketch.push();
        sketch.textFont("monospace", EDITOR_CONFIG.TEXT_SIZE);
        this.charWidth = sketch.textWidth("#");
        this.lineHeight = sketch.textLeading() * 1.07;
        sketch.pop();
        
        this.maxDisplayedLines = Math.floor((sketch.width - 10) / this.lineHeight);
    }

    /** Loads text for display. */
    loadText(text: string) {
        this.lines = [];

        // load everything into uncolored chunks for now
        const lines = text.split("\n");

        for (const line of lines) {
            const lineChunks: TextChunk[] = [
                { text: line, color: EDITOR_CONFIG.COLORS.DEFAULT }
            ];
            this.lines.push(lineChunks);
        }
    }

    render(scrollLine: number) {
        if (!this.lines) { return; }

        this.sketch.push();

        this.sketch.textFont("monospace", EDITOR_CONFIG.TEXT_SIZE);
        this.sketch.textAlign("left", "top");
        this.sketch.noStroke();

        this.sketch.translate(0, 5);
        for (
            let i = scrollLine - 1;
            i < this.lines.length && i < this.maxDisplayedLines + scrollLine;
            ++i
        ) {
            const line = this.lines[i];
            let x = 0;
            for (const chunk of line) {
                if (chunk.color !== "") {
                    this.sketch.fill(chunk.color);
                    this.sketch.text(chunk.text, x, 0);
                }

                x += this.charWidth * chunk.text.length;
            }

            // drop down so the next line is still at (0, 0)
            this.sketch.translate(0, this.lineHeight);
        }

        this.sketch.pop();
    }

    numLines(): number {
        if (this.lines) { return this.lines.length }
        return 0;
    }
}