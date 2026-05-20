import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";

/**
 * CREATE DICT
 */
function parseCreateDict(block) {

    const pairs = [];

    let i = 0;

    while (block.values?.[`ADD${i}`]) {

        const pairBlock = block.values[`ADD${i}`].block;

        if (pairBlock) {

            const key = pairBlock.values?.KEY?.block
                ? parseBlock(pairBlock.values.KEY.block)
                : null;

            const value = pairBlock.values?.VALUE?.block
                ? parseBlock(pairBlock.values.VALUE.block)
                : null;

            pairs.push({ key, value });
        }

        i++;
    }

    return {
        kind: "DictCreate",
        pairs
    };
}


/**
 * LOOKUP
 */
function parseLookup(block) {
    return {
        kind: "DictLookup",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        key: block.values?.KEY?.block ? parseBlock(block.values.KEY.block) : null,
        default: block.values?.NOTFOUND?.block ? parseBlock(block.values.NOTFOUND.block) : null
    };
}


/**
 * SET PAIR
 */
function parseSetPair(block) {
    return {
        kind: "DictSet",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        key: block.values?.KEY?.block ? parseBlock(block.values.KEY.block) : null,
        value: block.values?.VALUE?.block ? parseBlock(block.values.VALUE.block) : null
    };
}


/**
 * DELETE
 */
function parseDelete(block) {
    return {
        kind: "DictDelete",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        key: block.values?.KEY?.block ? parseBlock(block.values.KEY.block) : null
    };
}


/**
 * HAS KEY
 */
function parseHasKey(block) {
    return {
        kind: "DictHasKey",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        key: block.values?.KEY?.block ? parseBlock(block.values.KEY.block) : null
    };
}


/**
 * LENGTH
 */
function parseLength(block) {
    return {
        kind: "DictLength",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null
    };
}


/**
 * COPY
 */
function parseCopy(block) {
    return {
        kind: "DictCopy",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null
    };
}


/**
 * MERGE
 */
function parseCombine(block) {
    return {
        kind: "DictCombine",
        dict1: block.values?.DICT1?.block ? parseBlock(block.values.DICT1.block) : null,
        dict2: block.values?.DICT2?.block ? parseBlock(block.values.DICT2.block) : null
    };
}


/**
 * LOOKUP (SAFE PATH)
 */
function parseRecursiveLookup(block) {
    return {
        kind: "DictRecursiveLookup",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        path: block.values?.KEYS?.block ? parseBlock(block.values.KEYS.block) : null,
        default: block.values?.NOTFOUND?.block ? parseBlock(block.values.NOTFOUND.block) : null
    };
}


/**
 * SET (SAFE PATH)
 */
function parseRecursiveSet(block) {
    return {
        kind: "DictRecursiveSet",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null,
        path: block.values?.KEYS?.block ? parseBlock(block.values.KEYS.block) : null,
        value: block.values?.VALUE?.block ? parseBlock(block.values.VALUE.block) : null
    };
}


/**
 * GETTERS
 */
function parseGetters(block) {
    return {
        kind: "DictGetters",
        mode: block.fields?.OP || "UNKNOWN",
        dict: block.values?.DICT?.block ? parseBlock(block.values.DICT.block) : null
    };
}


/**
 * REGISTER
 */
register("dictionaries_create_with", parseCreateDict);
register("dictionaries_lookup", parseLookup);
register("dictionaries_set_pair", parseSetPair);
register("dictionaries_delete_pair", parseDelete);

register("dictionaries_is_key_in", parseHasKey);
register("dictionaries_length", parseLength);

register("dictionaries_copy", parseCopy);
register("dictionaries_combine_dicts", parseCombine);

register("dictionaries_recursive_lookup", parseRecursiveLookup);
register("dictionaries_recursive_set", parseRecursiveSet);

register("dictionaries_getters", parseGetters);