import { registerEmitter } from "../../registry/emitters.js";


/**
 * Variable Get
 */
registerEmitter("VarGet", node => {
    if (node.global) {
        return node.name;
    }
    return node.name;
});


/**
 * Variable Set
 */
registerEmitter("VarSet", (node, emit) => {
    const value = emit(node.value);

    if (node.global) {
        return `${node.name} = ${value};`;
    }

    return `${node.name} = ${value};`;
});


/**
 * Global Variable Declaration
 */
registerEmitter("GlobalVar", (node, emit) => {
    const value = emit(node.value);
    return `let ${node.name} = ${value};`;
});


/**
 * Variable Body (local scope block)
 */
registerEmitter("VarBody", (node, emit) => {

    const vars = node.vars || node.varNames?.map((name, i) => ({
        name,
        value: node.varValues?.[i]
    })) || [];

    const declarations = vars.map(v => {
        const value = v.value ? emit(v.value) : "undefined";
        return `let ${v.name} = ${value};`;
    });

    const body = (node.body || [])
        .map(stmt => emit(stmt))
        .join("\n");

    return `{\n${declarations.join("\n")}\n${body}\n}`;
});


/**
 * Variable Result (expression scoped variables)
 */
registerEmitter("VarResult", (node, emit) => {
    const declarations = node.varNames.map((name, i) => {
        const value = emit(node.varValues[i]);
        return `let ${name} = ${value};`;
    });

    const result = emit(node.result);

    return `(() => {\n${declarations.join("\n")}\nreturn ${result};\n})()`;
});