import "./registry/blockParsers.js";
import "./registry/emitters.js";

import { parseXml } from "./core/parseXml.js";
import { parseBlock } from "./core/parseBlock.js";
import { generateJava } from "./output/java/Generator.js";

export function compile(xml) {
    const rawBlocks = parseXml(xml);

    const ast = rawBlocks.map(parseBlock);

    console.log("AST:", JSON.stringify(ast, null, 2));

    return generateJava(ast);
}