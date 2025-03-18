/**
 * Configs for the sketch environment.
 */
const CONFIG = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,
    SIDEBAR_WIDTH: 275,
    SIDEBAR_TEXT_SIZE: 20,
    /**
     * If true, the menu that normally appears when you right click is disabled when clicking the
     * sketch. This does *not* disable it for the rest of the webpage.
     */
    DISABLE_RIGHT_CLICK_MENU: true,
    /**
     * Default turtle move speed in pixels per second. Set to 0 for instant movement.
     */
    DEFAULT_TURTLE_SPEED: 250,
    /**
     * How many loop iterations are allowed before an error is thrown.
     */
    MAX_LOOP_ITERATIONS: 1000
};
export default CONFIG;