import { parseBlock } from "./parseBlock.js";

export function recursiveParse(block) {
    const out = [];

    while (block) {
        out.push(parseBlock(block));
        block = block.next || null;
    }

    return out;
}