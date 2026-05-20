import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";

/**
 * CREATE LIST
 */
function parseCreateList(block) {
    const items = [];

    let i = 0;
    while (block.values?.[`ADD${i}`]) {
        const raw = block.values[`ADD${i}`].block;
        items.push(raw ? parseBlock(raw) : null);
        i++;
    }

    return {
        kind: "list_create",
        items
    };
}

/**
 * FROM CSV ROW
 */
function parseListFromCsvRow(block) {
    return {
        kind: "ListFromCsvRow",
        function: "listFromCsvRow",
        args: [
            parseBlock(block.values?.TEXT?.block)
        ]
    };
}

/**
 * ADD ITEMS
 */
function parseAddItems(block) {
    const items = [];

    let i = 0;
    while (block.values?.[`ITEM${i}`]) {
        const raw = block.values[`ITEM${i}`].block;
        items.push(raw ? parseBlock(raw) : null);
        i++;
    }

    return {
        kind: "list_add",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        items
    };
}

/**
 * GET ITEM
 */
function parseGetItem(block) {
    return {
        kind: "ListGet",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        index: block.values?.NUM?.block
            ? parseBlock(block.values.NUM.block)
            : null
    };
}

/**
 * SET ITEM
 */
function parseReplaceItem(block) {
    return {
        kind: "list_set",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        index: block.values?.NUM?.block
            ? parseBlock(block.values.NUM.block)
            : null,
        value: block.values?.ITEM?.block
            ? parseBlock(block.values.ITEM.block)
            : null
    };
}

/**
 * INSERT ITEM
 */
function parseInsertItem(block) {
    return {
        kind: "list_insert",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        index: block.values?.INDEX?.block
            ? parseBlock(block.values.INDEX.block)
            : null,
        value: block.values?.ITEM?.block
            ? parseBlock(block.values.ITEM.block)
            : null
    };
}

/**
 * REMOVE ITEM
 */
function parseRemoveItem(block) {
    return {
        kind: "list_remove",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        index: block.values?.INDEX?.block
            ? parseBlock(block.values.INDEX.block)
            : null
    };
}

/**
 * LENGTH
 */
function parseLength(block) {
    return {
        kind: "list_length",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null
    };
}

/**
 * CONTAINS
 */
function parseContains(block) {
    return {
        kind: "list_contains",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        item: block.values?.ITEM?.block
            ? parseBlock(block.values.ITEM.block)
            : null
    };
}

/**
 * INDEX OF
 */
function parseIndexOf(block) {
    return {
        kind: "list_index_of",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        item: block.values?.ITEM?.block
            ? parseBlock(block.values.ITEM.block)
            : null
    };
}

/**
 * IS EMPTY
 */
function parseIsEmpty(block) {
    return {
        kind: "list_is_empty",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null
    };
}

/**
 * RANDOM ITEM
 */
function parseRandomItem(block) {
    return {
        kind: "list_random",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null
    };
}

/**
 * SLICE
 */
function parseSlice(block) {
    return {
        kind: "list_slice",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        start: block.values?.INDEX1?.block
            ? parseBlock(block.values.INDEX1.block)
            : null,
        end: block.values?.INDEX2?.block
            ? parseBlock(block.values.INDEX2.block)
            : null
    };
}

/**
 * COPY
 */
function parseCopy(block) {
    return {
        kind: "list_copy",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null
    };
}

/**
 * REVERSE
 */
function parseReverse(block) {
    return {
        kind: "list_reverse",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null
    };
}

/**
 * SORT
 */
function parseSort(block) {
    return {
        kind: "list_sort",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        order: block.fields?.DIRECTION || "ASC"
    };
}

/**
 * MAP
 */
function parseMap(block) {
    return {
        kind: "list_map",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        expression: block.values?.TO?.block
            ? parseBlock(block.values.TO.block)
            : null,
        var: block.fields?.VAR || null
    };
}

/**
 * FILTER
 */
function parseFilter(block) {
    return {
        kind: "list_filter",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        test: block.values?.TEST?.block
            ? parseBlock(block.values.TEST.block)
            : null,
        var: block.fields?.VAR || null
    };
}

/**
 * REDUCE
 */
function parseReduce(block) {
    return {
        kind: "list_reduce",
        list: block.values?.LIST?.block
            ? parseBlock(block.values.LIST.block)
            : null,
        initial: block.values?.INITANSWER?.block
            ? parseBlock(block.values.INITANSWER.block)
            : null,
        combine: block.values?.COMBINE?.block
            ? parseBlock(block.values.COMBINE.block)
            : null,
        itemVar: block.fields?.VAR1 || null,
        accVar: block.fields?.VAR2 || null
    };
}

/**
 * REGISTER
 */
register("lists_create_with", parseCreateList);
register("lists_from_csv_row", parseListFromCsvRow);

register("lists_add_items", parseAddItems);

register("lists_select_item", parseGetItem);
register("lists_replace_item", parseReplaceItem);
register("lists_insert_item", parseInsertItem);
register("lists_remove_item", parseRemoveItem);

register("lists_length", parseLength);
register("lists_is_empty", parseIsEmpty);
register("lists_is_in", parseContains);
register("lists_position_in", parseIndexOf);

register("lists_pick_random_item", parseRandomItem);

register("lists_slice", parseSlice);

register("lists_copy", parseCopy);
register("lists_reverse", parseReverse);
register("lists_sort", parseSort);

register("lists_map", parseMap);
register("lists_filter", parseFilter);
register("lists_reduce", parseReduce);