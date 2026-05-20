import { PARSERS } from "../registry/blockParsers.js";

export function parseBlock(block) {
    const fn = PARSERS.get(block.type);

    if (!fn) {
        throw new Error("No parser for: " + block.type);
    }

    const node = fn(block);

    return node;
}

export function parseStatementChain(block) {
    const statements = [];
    let current = block;

    while (current) {
        statements.push(parseBlock(current));
        current = current.next?.block ?? null;
    }

    return statements;
}