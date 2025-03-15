import EDITOR_CONFIG from "../../config/editorConfig.js";
import TextRenderer from "./text-renderer.js";

// temporary, will be removed later
const SAMPLE_CODE = (
`var PIXEL_SIZE = 25;
# image data - each character here corresponds to a pixel
var PIXELS = [
  "     ##   ",
  "  ###gg#  ",
  " #gg#GGg# ",
  "#G#PggP#G#",
  " #PpPPpP# ",
  "#prrRRRRp#",
  "#rRRRrRRr#",
  "#pRrRpRRp#",
  "#RppRRppR#",
  " #RppppR# ",
  "  #RppR#  ",
  "   #RR#   ",
  "    ##    "
];

# colors:
# '#': black
# 'g': light green
# 'G': dark green
# 'p': light purple/magenta
# 'P': purple
# 'r': light red
# 'R': red
function findColor(char) {
  if (char == "#") {
    setColor(0, 0, 0);
  }
  else if (char == "g") {
    setColor(106, 190, 48);
  }
  else if (char == "G") {
    setColor(55, 148, 110);
  }
  else if (char == "p") {
    setColor(138, 15, 54);
  }
  else if (char == "P") {
    setColor(73, 22, 117);
  }
  else if (char == "r") {
    setColor(255, 95, 66);
  }
  else if (char == "R") {
    setColor(222, 42, 42);
  }
  else {
    print("Could not find color for character '" + char + "'");
  }
}

# draws a square
function square() {
  setAngle(90);
  beginPoly();
  for (var i = 0; i < 4; i = i + 1) {
    moveFwd(PIXEL_SIZE);
    dropVertex();
    rotate(90);
  }
  endPoly();
}

setAngle(90);

for (var y = 0; y < length(PIXELS); y = y + 1) {
  setPos(PIXEL_SIZE, PIXEL_SIZE * (y + 1));
  var row = PIXELS[y];
  for (var x = 0; x < length(row); x = x + 1) {
    if (row[x] != " ") {
      findColor(row[x]);
      square();
    }
    penUp();
    moveFwd(PIXEL_SIZE);
    penDown();
  }
}
hideTurtle();`
);

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

        // temporary, will be removed later
        renderer.loadText(SAMPLE_CODE);
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