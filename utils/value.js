export function emitValue(v) {
    if (!v) return "null";

    switch (v.type) {
        case "Text":
            return `"${v.value}"`;
        case "MathNumber":
            return v.value;
        case "VarGet":
            return v.name;
        case "MathExpr":
            return `(${v.operands.map(emitValue).join(` ${v.operator} `)})`;
        default:
            return "/* unknown */";
    }
}