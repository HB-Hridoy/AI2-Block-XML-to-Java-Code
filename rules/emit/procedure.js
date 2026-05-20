import { registerEmitter } from "../../registry/emitters.js";


function emitArgs(node, emit) {
    return (node.args || [])
        .map(arg => emit(arg))
        .join(", ");
}


/**
 * Procedure Call (no return)
 */
registerEmitter("ProcedureCall", (node, emit) => {
    return `${node.name}(${emitArgs(node, emit)});`;
});


/**
 * Procedure Call (with return)
 */
registerEmitter("ReturnProcedureCall", (node, emit) => {
    return `${node.name}(${emitArgs(node, emit)})`;
});


/**
 * Void Procedure (definition)
 */
registerEmitter("VoidProcedure", (node, emit) => {

    const params = (node.parameters || []).join(", ");
    const body = (node.body || [])
        .map(stmt => emit(stmt))
        .join("\n");

    return `public void ${node.name}(${params}) {\n${body}\n}`;
});


/**
 * Return Procedure (definition)
 */
registerEmitter("ReturnProcedure", (node, emit) => {

    const params = (node.parameters || []).join(", ");
    const value = emit(node.return);

    return `function ${node.name}(${params}) {\n    return ${value};\n}`;
});