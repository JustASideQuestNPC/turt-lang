/**
 * Creates and runs the actual sketch object. A common theme in this code is that p5js is a
 * TOTALLY PERFECT library with NO FLAWS WHATSOEVER. On an entirely unrelated note, I would really
 * like to try whatever the p5js devs have been smoking.
 */
import SKETCH_CONFIG from "../config/sketchConfig.js";
import addCanvasListeners from "./listener-generator.js";
import TurtLang from "./interpreter/turtLang.js";
import Turtle from "./turtle.js";

const DEFAULT_TURTLE_SPEED = 250; // set to 0 for infinite

let turtle: Turtle;
let codeFileInput: HTMLInputElement;

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
        const canvas = p5.createCanvas(SKETCH_CONFIG.SCREEN_WIDTH, SKETCH_CONFIG.SCREEN_HEIGHT);
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

        // initialize everything
        turtle = new Turtle(p5, DEFAULT_TURTLE_SPEED);
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
            if (TurtLang.loaded() && TurtLang.finished()) {
                // this is async so it'll keep running in the background until it's done
                TurtLang.run();
            }
        };
    };

    p5.draw = () => {
        if (turtle.gliding) {
            turtle.updateGlide();
        }

        p5.background("#e0e0e0");
        turtle.render();
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