import { registerEmitter } from "../../registry/emitters.js";
import { emit } from "../../core/emit.js";

/**
 * SAFE EMIT
 */
const safeEmit = (node) => {
    if (!node) return "null";
    return emit(node);
};

/**
 * DICT CREATE
 */
registerEmitter("DictCreate", node => {

    const pairs =
        (node.pairs || [])
            .map(pair => {

                const key = safeEmit(pair.key);
                const value = safeEmit(pair.value);

                return `{${key}, ${value}}`;
            })
            .join(", ");

    return `CreateDict(new Object[]{${pairs}})`;
});


/**
 * DICT LOOKUP
 */
registerEmitter("DictLookup", node => {

    return `DictGet(
        ${safeEmit(node.dict)},
        ${safeEmit(node.key)},
        ${safeEmit(node.default)}
    )`.replace(/\n\s+/g, " ");
});


/**
 * DICT SET
 */
registerEmitter("DictSet", node => {

    return `DictSet(
        ${safeEmit(node.dict)},
        ${safeEmit(node.key)},
        ${safeEmit(node.value)}
    );`.replace(/\n\s+/g, " ");
});


/**
 * DICT DELETE
 */
registerEmitter("DictDelete", node => {

    return `DictRemove(
        ${safeEmit(node.dict)},
        ${safeEmit(node.key)}
    );`.replace(/\n\s+/g, " ");
});


/**
 * HAS KEY
 */
registerEmitter("DictHasKey", node => {

    return `DictContainsKey(
        ${safeEmit(node.dict)},
        ${safeEmit(node.key)}
    )`;
});


/**
 * LENGTH
 */
registerEmitter("DictLength", node => {

    return `DictSize(${safeEmit(node.dict)})`;
});


/**
 * DICT TO LIST
 */
registerEmitter("DictToList", node => {

    return `DictToList(${safeEmit(node.dict)})`;
});


/**
 * LIST TO DICT
 */
registerEmitter("ListToDict", node => {

    return `ListToDict(${safeEmit(node.list)})`;
});


/**
 * COPY DICT
 */
registerEmitter("DictCopy", node => {

    return `DictCopy(${safeEmit(node.dict)})`;
});


/**
 * MERGE DICTS
 */
registerEmitter("DictCombine", node => {

    return `DictMerge(
        ${safeEmit(node.dict1)},
        ${safeEmit(node.dict2)}
    )`.replace(/\n\s+/g, " ");
});


/**
 * RECURSIVE LOOKUP
 */
registerEmitter("DictRecursiveLookup", node => {

    return `DictGetPath(
        ${safeEmit(node.dict)},
        ${safeEmit(node.path)},
        ${safeEmit(node.default)}
    )`.replace(/\n\s+/g, " ");
});


/**
 * RECURSIVE SET
 */
registerEmitter("DictRecursiveSet", node => {

    return `DictSetPath(
        ${safeEmit(node.dict)},
        ${safeEmit(node.path)},
        ${safeEmit(node.value)}
    );`.replace(/\n\s+/g, " ");
});


/**
 * GETTERS
 */
registerEmitter("DictGetters", node => {

    return `DictGetters(
        ${safeEmit(node.dict)},
        "${node.mode}"
    )`;
});