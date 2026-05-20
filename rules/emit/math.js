import { registerEmitter } from "../../registry/emitters.js";
import { emit } from "../../core/emit.js";


registerEmitter("MathNumber", node => {
    return String(node.value);
});



registerEmitter("MathExpression", node => {

    const operands =
        (node.operands || [])
            .map(emit);

    if (operands.length === 1) {
        return operands[0];
    }

    return `(${operands.join(
        ` ${node.operator} `
    )})`;
});



registerEmitter("MathFunction", node => {

    const args =
        (node.operands || [])
            .map(emit)
            .join(", ");

    return `${node.operation}(${args})`;
});



registerEmitter("MathRandomInt", node => {

    return `randomInt(
        ${emit(node.from)},
        ${emit(node.to)}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("MathRandomFloat", () => {
    return "randomFloat()";
});



registerEmitter("MathRadix", node => {

    switch (node.radix) {

        case 2:
            return `0b${node.number}`;

        case 8:
            return `0${node.number}`;

        case 10:
            return `${node.number}`;

        case 16:
            return `0x${node.number}`;

        default:
            throw new Error(
                "Unsupported radix: " +
                node.radix
            );
    }
});