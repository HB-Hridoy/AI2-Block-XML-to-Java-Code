import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";


function parseValues(block) {
    return Object.values(block.values || {})
        .map(v => parseBlock(parseBlock(v.block)));
}


function parseSingleValue(block) {
    const first =
        Object.values(block.values || {})[0];

    return first
        ? parseBlock(first.block)
        : null;
}


function parseTextMethod(
    block,
    method,
    text,
    args = []
) {
    return {
        kind: "TextMethod",
        method,
        text,
        args
    };
}



register("text", block => ({
    kind: "TextString",
    text: block.fields.TEXT || ""
}));



register("obfuscated_text", block => ({
    kind: "TextObfuscate",
    text: block.fields.TEXT || ""
}));



register("text_join", block => ({
    kind: "TextExpression",
    operator: "+",
    operands: parseValues(block)
}));



register("text_length", block => ({
    kind: "TextProperty",
    property: "len",
    text: parseSingleValue(block)
}));



register("text_isEmpty", block => ({
    kind: "TextProperty",
    property: "isEmpty",
    text: parseSingleValue(block)
}));



register("text_trim", block => ({
    kind: "TextProperty",
    property: "trim",
    text: parseSingleValue(block)
}));



register("text_reverse", block => ({
    kind: "TextProperty",
    property: "reverse",
    text: parseSingleValue(block)
}));



register("text_split_at_spaces", block => ({
    kind: "TextProperty",
    property: "splitAtSpaces",
    text: parseSingleValue(block)
}));



register("text_is_string", block => ({
    kind: "TextProperty",
    property: "isString",
    text: parseSingleValue(block)
}));



register("text_compare", block => {

    const opMap = {
        EQ: "===",
        NEQ: "!==",
        LT: "<<",
        RT: ">>"
    };

    return {
        kind: "TextExpression",
        operator: opMap[block.fields.OP],
        operands: parseValues(block)
    };
});



register("text_changeCase", block => {

    const propertyMap = {
        UPCASE: "upper",
        DOWNCASE: "lower"
    };

    return {
        kind: "TextProperty",
        property:
            propertyMap[block.fields.OP],
        text: parseSingleValue(block)
    };
});



register("text_starts_at", block => {

    return parseTextMethod(
        block,
        "startsWith",
        parseBlock(block.values.TEXT.block),
        [
            parseBlock(
                block.values.PIECE.block
            )
        ]
    );
});



register("text_contains", block => {

    const methodMap = {
        CONTAINS: "contains",
        CONTAINS_ANY: "containsAny",
        CONTAINS_ALL: "containsAll"
    };

    return parseTextMethod(
        block,
        methodMap[block.fields.OP],
        parseBlock(block.values.TEXT.block),
        [
            parseBlock(
                block.values.PIECE.block
            )
        ]
    );
});



register("text_split", block => {

    const methodMap = {
        SPLIT: "split",
        SPLITATFIRST: "splitFirst",
        SPLITATANY: "splitAny",
        SPLITATFIRSTOFANY: "splitFirstOfAny"
    };

    return parseTextMethod(
        block,
        methodMap[block.fields.OP],
        parseBlock(block.values.TEXT.block),
        [
            parseBlock(
                block.values.AT.block
            )
        ]
    );
});



register("text_segment", block => ({
    kind: "TextSegment",
    text:
        parseBlock(
            block.values.TEXT.block
        ),
    start:
        parseBlock(
            block.values.START.block
        ),
    length:
        parseBlock(
            block.values.LENGTH.block
        )
}));



register("text_replace_all", block => {

    return parseTextMethod(
        block,
        "replace",
        parseBlock(
            block.values.TEXT.block
        ),
        [
            parseBlock(
                block.values.SEGMENT.block
            ),
            parseBlock(
                block.values.REPLACEMENT.block
            )
        ]
    );
});



register("text_replace_mappings", block => {

    const methodMap = {
        LONGEST_STRING_FIRST:
            "replaceMapLongestFirst",

        DICTIONARY_ORDER:
            "replaceMap"
    };

    return parseTextMethod(
        block,
        methodMap[block.fields.OP],
        parseBlock(
            block.values.TEXT.block
        ),
        [
            parseBlock(
                block.values.MAPPINGS.block
            )
        ]
    );
});