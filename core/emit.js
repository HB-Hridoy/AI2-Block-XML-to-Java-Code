import { EMITTERS } from "../registry/emitters.js";

export function emit(node) {
    if (!node) {
        throw new Error("emit received null/undefined node");
    }

    // debug
    console.log("EMIT KIND:", node.kind, node);

    if (!node.kind) {
        console.log("BAD NODE:", node);
        throw new Error("Missing kind in node");
    }

    const fn = EMITTERS.get(node.kind);

    if (!fn) {
        throw new Error("No emitter for: " + node.kind);
    }

    return fn(node, emit);
}
