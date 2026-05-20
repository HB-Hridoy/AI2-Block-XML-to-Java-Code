import { register } from "../../registry/blockParsers.js";

/**
 * IF block
 */
function parseIf(block) {
    return {
        kind: "if",
        conditions: block.values?.IF || null,
        bodies: block.statements?.DO || null,
        elseBody: block.statements?.ELSE || null
    };
}

/**
 * WHILE loop
 */
function parseWhile(block) {
    return {
        kind: "while",
        condition: block.values?.TEST || null,
        body: block.statements?.DO || null
    };
}

/**
 * FOR RANGE loop
 */
function parseForRange(block) {
    return {
        kind: "for_range",
        var: block.fields?.VAR,
        start: block.values?.START?.block || null,
        end: block.values?.END?.block || null,
        step: block.values?.STEP?.block || null,
        body: block.statements?.DO || null
    };
}

/**
 * FOR EACH (list iteration)
 */
function parseForEach(block) {
    return {
        kind: "for_each",
        var: block.fields?.VAR,
        list: block.values?.LIST?.block || null,
        body: block.statements?.DO || null
    };
}

/**
 * CHOOSE (ternary-style block)
 */
function parseChoose(block) {
    return {
        kind: "choose",
        condition: block.values?.TEST?.block || null,
        then: block.values?.THENRETURN?.block || null,
        else: block.values?.ELSERETURN?.block || null
    };
}

/**
 * DO THEN RETURN (expression + block)
 */
function parseDoThenReturn(block) {
    return {
        kind: "do_then_return",
        body: block.statements?.DO || null,
        result: block.values?.RETURN?.block || null
    };
}

/**
 * BREAK
 */
function parseBreak(block) {
    return {
        kind: "break"
    };
}

/**
 * SCREEN NAVIGATION
 */
function parseOpenScreen(block) {
    return {
        kind: "open_screen",
        screen: block.values?.SCREENNAME?.block || null
    };
}

function parseOpenScreenWithValue(block) {
    return {
        kind: "open_screen_with_value",
        screen: block.values?.SCREENNAME?.block || null,
        value: block.values?.STARTVALUE?.block || null
    };
}

function parseCloseScreen(block) {
    return {
        kind: "close_screen"
    };
}

function parseCloseScreenWithValue(block) {
    return {
        kind: "close_screen_with_value",
        value: block.values?.VALUE?.block || null
    };
}

/**
 * REGISTER CONTROL BLOCKS
 */
register("controls_if", parseIf);
register("controls_choose", parseChoose);

register("controls_forRange", parseForRange);
register("controls_forEach", parseForEach);

register("controls_while", parseWhile);

register("controls_break", parseBreak);

register("controls_do_then_return", parseDoThenReturn);

register("controls_openAnotherScreen", parseOpenScreen);
register("controls_openAnotherScreenWithStartValue", parseOpenScreenWithValue);

register("controls_closeScreen", parseCloseScreen);
register("controls_closeScreenWithValue", parseCloseScreenWithValue);