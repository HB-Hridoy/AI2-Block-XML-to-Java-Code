import { registerEmitter } from "../../registry/emitters.js";


function emitArgs(node, emit) {
    return (node.operands || [])
        .map(v => emit(v))
        .join(", ");
}


registerEmitter("TextString", node => {
    return JSON.stringify(node.text ?? "");
});


registerEmitter("TextExpr", (node, emit) => {
    const values = (node.operands || []).map(v => emit(v));

    if (values.length === 1) {
        return values[0];
    }

    return `(${values.join(` ${node.operation} `)})`;
});


registerEmitter("TextProperty", (node, emit) => {
    const text = emit(node.text);

    switch (node.property) {
        case "len":
            return `${text}.length`;

        case "isEmpty":
            return `(${text}.length === 0)`;

        case "trim":
            return `${text}.trim()`;

        case "reverse":
            return `${text}.split("").reverse().join("")`;

        case "splitAtSpaces":
            return `${text}.split(" ")`;

        case "isString":
            return `typeof ${text} === "string"`;

        default:
            return `${text}`;
    }
});


registerEmitter("TextSegment", (node, emit) => {
    const text = emit(node.text);
    const start = emit(node.start);
    const length = emit(node.length);

    return `${text}.substr(${start}, ${length})`;
});


registerEmitter("TextMethod", (node, emit) => {
    const text = emit(node.text);
    const args = emitArgs(node, emit);

    switch (node.method) {
        case "replace":
            return `${text}.replace(${args})`;

        case "split":
        case "splitFirst":
        case "splitAny":
        case "splitFirstOfAny":
            return `${text}.split(${args})`;

        case "contains":
            return `${text}.includes(${args})`;

        case "containsAny":
            return `[${args}].some(v => ${text}.includes(v))`;

        case "containsAll":
            return `[${args}].every(v => ${text}.includes(v))`;

        case "startsWith":
            return `${text}.startsWith(${args})`;

        case "replaceMap":
        case "replaceMapLongestFirst":
            return `replaceMap(${text}, ${args})`;

        default:
            return `${text}`;
    }
});


registerEmitter("TextObfuscate", node => {
    return `obfuscate(${JSON.stringify(node.text ?? "")})`;
});