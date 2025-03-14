/**
 * Creates and runs the actual sketch object. A common theme in this code is that p5js is a
 * TOTALLY PERFECT library with NO FLAWS WHATSOEVER. On an entirely unrelated note, I would really
 * like to try whatever the p5js devs have been smoking.
 */
import { SKETCH_CONFIG } from "../config/sketchConfig.js";
import { addCanvasListeners } from "./listener-generator.js";
import TurtLang from "./interpreter/turtLang.js";
import Turtle from "./turtle.js";

let turtle: Turtle;

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
            mouseReleased: mouseReleased
        });

        // initialize everything
        turtle = new Turtle(p5);
        TurtLang.init(turtle);

        const codeLine = <HTMLInputElement>document.getElementById("codeLine");
        const runButton = document.getElementById("runCodeLine");
        runButton.onclick = () => {
            TurtLang.runLine(codeLine.value);
            // codeLine.value = "";
        };
    };

    p5.draw = () => {
        p5.background("#e0e0e0");

        turtle.render();
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
};

// error checks need to be disabled here because otherwise typescript explodes for some reason
// @ts-ignore
const instance = new p5(sketch);