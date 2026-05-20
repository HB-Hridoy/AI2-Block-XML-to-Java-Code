import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";


function parseValues(block) {
    return Object.values(block.values || {})
        .map(v => parseBlock(v.block));
}


function parseMathFunction(block, operation) {
    return {
        kind: "MathFunction",
        operation,
        operands: parseValues(block)
    };
}


register("math_number", block => ({
    kind: "MathNumber",
    value: Number(block.fields.NUM || 0)
}));


register("math_compare", block => {

    const operatorMap = {
        EQ: "==",
        NEQ: "!=",
        LT: "<",
        LTE: "<=",
        GT: ">",
        GTE: ">="
    };

    return {
        kind: "MathExpression",
        operator: operatorMap[block.fields.OP],
        operands: parseValues(block)
    };
});


register("math_add", block => ({
    kind: "MathExpression",
    operator: "+",
    operands: parseValues(block)
}));


register("math_subtract", block => ({
    kind: "MathExpression",
    operator: "-",
    operands: parseValues(block)
}));


register("math_multiply", block => ({
    kind: "MathExpression",
    operator: "*",
    operands: parseValues(block)
}));


register("math_division", block => ({
    kind: "MathExpression",
    operator: "/",
    operands: parseValues(block)
}));


register("math_power", block => ({
    kind: "MathExpression",
    operator: "^",
    operands: parseValues(block)
}));


register("math_random_int", block => ({
    kind: "MathRandomInt",
    from: parseBlock(block.values.FROM.block),
    to: parseBlock(block.values.TO.block)
}));


register("math_random_float", () => ({
    kind: "MathRandomFloat"
}));


register("math_single", block => {

    const opMap = {
        ROOT: "sqrt",
        ABS: "abs",
        NEG: "neg",
        LN: "log",
        LOG: "log10",
        EXP: "exp",
        ROUND: "round",
        CEILING: "ceil",
        FLOOR: "floor"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});


register("math_trig", block => {

    const operation =
        block.fields.OP.toLowerCase();

    return parseMathFunction(
        block,
        operation
    );
});


register("math_on_list", block => {

    const operation =
        block.fields.OP.toLowerCase();

    return parseMathFunction(
        block,
        operation
    );
});


register("math_on_list2", block => {

    const opMap = {
        AVG: "avg",
        MIN: "minList",
        MAX: "maxList",
        GM: "geoMean",
        SD: "stdDev",
        SE: "stdErr"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});


register("math_bitwise", block => {

    const opMap = {
        BITAND: "&",
        BITOR: "|",
        BITXOR: "^"
    };

    return {
        kind: "MathExpression",
        operator: opMap[block.fields.OP],
        operands: parseValues(block)
    };
});


register("math_number_radix", block => {

    const radixMap = {
        BIN: 2,
        OCT: 8,
        DEC: 10,
        HEX: 16
    };

    return {
        kind: "MathRadix",
        radix: radixMap[block.fields.OP],
        number: block.fields.NUM
    };
});


register("math_divide", block => {

    const opMap = {
        MODULO: "mod",
        REMAINDER: "rem",
        QUOTIENT: "quot"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});


register("math_convert_angles", block => {

    const opMap = {
        RADIANS_TO_DEGREES: "toDegrees",
        DEGREES_TO_RADIANS: "toRadians"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});


register("math_is_a_number", block => {

    const opMap = {
        NUMBER: "isNum",
        BINARY: "isBin",
        HEXADECIMAL: "isHexa",
        BASE10: "isDecimal"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});


register("math_convert_number", block => {

    const opMap = {
        DEC_TO_HEX: "toHex",
        HEX_TO_DEC: "fromHex",
        DEC_TO_BIN: "toBin",
        BIN_TO_DEC: "fromBin"
    };

    return parseMathFunction(
        block,
        opMap[block.fields.OP]
    );
});