/**
 * Creates and runs the actual sketch object. A common theme in this code is that p5js is a
 * TOTALLY PERFECT library with NO FLAWS WHATSOEVER. On an entirely unrelated note, I would really
 * like to try whatever the p5js devs have been smoking.
 */
import CONFIG from "../config/_CONFIG.js";
import addCanvasListeners from "./listener-generator.js";
import TurtLang from "./interpreter/turtLang.js";
import Turtle from "./turtle.js";

let turtle: Turtle;
let codeFileInput: HTMLInputElement;
let running: boolean;
let sidebarPos: number;
let charWidth: number;
let lineHeight: number;

async function loadCodeFile(file: File) {
    // lock everything down until we're finished processing
    codeFileInput.disabled = true;
    console.log(`Name: '${file.name}'\nType: ${file.type}\nSize: ${file.size}`);
    console.log("Reading file...");
    const text = await file.text();
    console.log("Compiling...");

    if (TurtLang.compile(text)) {
        console.log("Done!");
    }

    codeFileInput.disabled = false;
    turtle.resetAll();
}

const sketch = (p5: p5) => {
    p5.setup = () => {
        const canvas = p5.createCanvas(CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        canvas.parent("sketchContainer");
        addCanvasListeners({
            canvas: canvas,
            disableContextMenu: false,
            keyPressed: keyPressed,
            keyReleased: keyReleased,
            mousePressed: mousePressed,
            mouseReleased: mouseReleased,
            mouseWheel: mouseWheel
        });

        sidebarPos = p5.width - CONFIG.SIDEBAR_WIDTH;
        // textWidth() and textLeading() are weird and require the font to be loaded
        p5.textFont("monospace", CONFIG.SIDEBAR_TEXT_SIZE);
        charWidth = p5.textWidth("#");
        lineHeight = p5.textLeading();

        // initialize everything
        turtle = new Turtle(p5, CONFIG.DEFAULT_TURTLE_SPEED, sidebarPos / 2, p5.height / 2);
        TurtLang.init(turtle);

        codeFileInput = <HTMLInputElement>document.getElementById("codeFile");
        codeFileInput.addEventListener("change", () => {
            const files = codeFileInput.files;
            if (files.length > 0) {
                const file = files[0];
                loadCodeFile(file);
            }
        });

        const runButton = document.getElementById("runCodeLine");
        runButton.onclick = () => {
            if (TurtLang.loaded()) {
                if (TurtLang.finished()) {
                    // this is async so it'll keep running in the background until it's done
                    TurtLang.run();
                    runButton.innerText = "Stop";
                }
                else {
                    TurtLang.killExecution();
                    runButton.innerText = "Run";
                }
            }
        };
    };

    p5.draw = () => {
        if (turtle.gliding) {
            turtle.updateGlide();
        }

        p5.background("#e0e0e0");
        turtle.render();

        // sidebar divider
        p5.noStroke();
        p5.fill("#ffffff");
        p5.rect(sidebarPos, 0, CONFIG.SIDEBAR_WIDTH, p5.height)
        p5.strokeWeight(4);
        p5.stroke("#000000");
        p5.line(sidebarPos, 0, sidebarPos, p5.height);

        p5.textFont("monospace", CONFIG.SIDEBAR_TEXT_SIZE);
        p5.textAlign("left", "top");
        p5.noStroke();
        p5.fill("#000000");

        // turtle info
        p5.text(
            `Position: (${Math.floor(turtle.position.x)}, ${Math.floor(turtle.position.y)})\n` +
            `Heading: ${Math.floor(turtle.heading * 180 / Math.PI)}\n` +
            `Pen Down: ${turtle.drawing}\n` +
            `Color:`,
            sidebarPos + 10, 5
        );

        // do some funky stuff to get a css color
        const turtleColor = turtle.currentColor;
        // i have no idea if flooring is necessary here tbh
        const r = Math.floor(p5.red(turtleColor)).toString(16).padStart(2, "0");
        const g = Math.floor(p5.green(turtleColor)).toString(16).padStart(2, "0");
        const b = Math.floor(p5.blue(turtleColor)).toString(16).padStart(2, "0");

        p5.fill(turtleColor);
        p5.text(`#${r}${g}${b}`, sidebarPos + charWidth * 7 + 10, lineHeight * 3 + 5);
    };

    function keyPressed(event: KeyboardEvent) {}

    function keyReleased(event: KeyboardEvent) {}

    function mousePressed(event: MouseEvent) {}
    
    function mouseReleased(event: MouseEvent) {}

    function mouseWheel(event: WheelEvent) {}
};

// error checks need to be disabled here because otherwise typescript explodes for some reason
// @ts-ignore
const instance = new p5(sketch);