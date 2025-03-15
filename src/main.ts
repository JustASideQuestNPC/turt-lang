/**
 * Creates and runs the actual sketch object. A common theme in this code is that p5js is a
 * TOTALLY PERFECT library with NO FLAWS WHATSOEVER. On an entirely unrelated note, I would really
 * like to try whatever the p5js devs have been smoking.
 */
import SKETCH_CONFIG from "../config/sketchConfig.js";
import addCanvasListeners from "./listener-generator.js";
import TurtLang from "./interpreter/turtLang.js";
import Editor from "./editor/editor.js";
import Turtle from "./turtle.js";

// TODO: make this actually work lmao
const TURTLE_SPEED = 0; // set to 0 for infinite

let programState: "turtle"|"editor";

let turtle: Turtle;
let running: boolean = false;
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
}

const sketch = (p5: p5) => {
    p5.setup = () => {
        const canvas = p5.createCanvas(SKETCH_CONFIG.SCREEN_WIDTH, SKETCH_CONFIG.SCREEN_HEIGHT);
        canvas.parent("sketchContainer");
        addCanvasListeners({
            canvas: canvas,
            disableContextMenu: true,
            keyPressed: keyPressed,
            keyReleased: keyReleased,
            mousePressed: mousePressed,
            mouseReleased: mouseReleased,
            mouseWheel: mouseWheel
        });

        // initialize everything
        turtle = new Turtle(p5, TURTLE_SPEED);
        TurtLang.init(turtle);
        Editor.init(p5);

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
                running = !running;
                if (running) { runButton.innerText = "Stop"; }
                else { runButton.innerText = "Run"; }
            }
        };

        programState = "turtle";
    };

    p5.draw = () => {
        if (programState === "turtle") {
            if (running) {
                if (turtle.gliding) {
                    turtle.updateGlide();
                }
                else if (!TurtLang.finished()) {
                    // console.log("running until glide");
                    TurtLang.runUntilGlide();
                }
                else {
                    // console.log("reached end of code");
                    running = false;
                }
            }
        }
        else {
            Editor.update();
        }

        if (programState === "turtle") {
            p5.background("#e0e0e0");
            turtle.render();
        }
        else {
            Editor.render();
        }
    };

    function keyPressed(event: KeyboardEvent) {
        // console.log(event);
    }

    function keyReleased(event: KeyboardEvent) {
        // console.log(event);
    }

    function mousePressed(event: MouseEvent) {
        // console.log(event);
    }
    
    function mouseReleased(event: MouseEvent) {
        // console.log(event);
    }

    function mouseWheel(event: WheelEvent) {
        Editor.scroll(event.deltaY);
    }
};

// error checks need to be disabled here because otherwise typescript explodes for some reason
// @ts-ignore
const instance = new p5(sketch);