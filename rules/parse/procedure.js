import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";


function parseArguments(block) {
    return Object.values(block.values || {})
        .map(v => parseBlock(v.block));
}


function parseMutationArgs(block) {
    return block.mutation.args || [];
}


function parseStatement(statement) {

    if (!statement?.block) {
        return [];
    }

    const blocks = [];

    let current = statement.block;

    while (current) {

        blocks.push(
            parseBlock(current)
        );

        current =
            current.next?.block || null;
    }

    return blocks;
}



register("procedures_defnoreturn", block => {

    const params =
        parseMutationArgs(block)
            .map(x => x.name);

    return {
        kind: "VoidProcedure",
        name: block.fields.NAME,
        parameters: params,
        body: parseStatement(
            block.statements.STACK
        )
    };
});



register("procedures_defreturn", block => {

    const params =
        parseMutationArgs(block)
            .map(x => x.name);

    return {
        kind: "ReturnProcedure",
        name: block.fields.NAME,
        parameters: params,
        returnValue: parseBlock(
            block.values.RETURN.block
        )
    };
});



register("procedures_callnoreturn", block => {

    return {
        kind: "ProcedureCall",
        name: block.fields.PROCNAME,
        parameters:
            parseMutationArgs(block)
                .map(x => x.name),
        args: parseArguments(block)
    };
});



register("procedures_callreturn", block => {

    return {
        kind: "ProcedureCall",
        name: block.fields.PROCNAME,
        parameters:
            parseMutationArgs(block)
                .map(x => x.name),
        args: parseArguments(block)
    };
});