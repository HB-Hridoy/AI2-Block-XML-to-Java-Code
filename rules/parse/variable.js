import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";
import { parseStatementChain } from "../../core/parseBlock.js";

/**
 * Var Get
 */
function parseVarGet(block) {
    return {
        kind: "VarGet",
        name: block.fields?.VAR || "unknown",
        global: false
    };
}

/**
 * Var Set
 */
function parseVarSet(block) {
    return {
        kind: "VarSet",
        name: block.fields?.VAR || "unknown",
        global: false,
        value: block.values?.VALUE?.block
            ? parseBlock(block.values.VALUE.block)
            : null
    };
}

/**
 * Global Var
 */
function parseGlobalVar(block) {
    return {
        kind: "GlobalVar",
        name: block.fields?.NAME || "global_unknown",
        value: block.values?.VALUE?.block
            ? parseBlock(block.values.VALUE.block)
            : null
    };
}

/**
 * Local Declaration (IMPORTANT FIX)
 */
function parseLocalDeclaration(block) {
    const varNames = [];
    const varValues = [];

    let i = 0;

    while (block.fields?.[`VAR${i}`] !== undefined) {
        varNames.push(block.fields[`VAR${i}`]);

        const raw = block.values?.[`DECL${i}`]?.block;
        varValues.push(parseBlock(raw));
        // varValues.push(raw ? parseBlock(raw) : null);

        i++;
    }

    // ↓ was BODY, should be STACK
    const bodyRaw = block.statements?.STACK?.block;

    return {
        kind: block.type === "local_declaration_expression"
            ? "VarResult"
            : "VarBody",

        varNames,
        varValues,

        // ↓ walk the full next chain, not just the first block
        body: parseStatementChain(bodyRaw)
    };
}

/**
 * REGISTER
 */
register("lexical_variable_get", parseVarGet);
register("lexical_variable_set", parseVarSet);
register("global_declaration", parseGlobalVar);
register("local_declaration_statement", parseLocalDeclaration);
register("local_declaration_expression", parseLocalDeclaration);