import { register } from "../../registry/blockParsers.js";
import { parseBlock } from "../../core/parseBlock.js";

/**
 * Component reference block
 * Example: Button1, Label1, etc.
 */
function parseComponent(block) {
    return {
        kind: "Component",
        name: block.fields?.COMPONENT || block.mutation?.instance_name || "unknown_component"
    };
}

/**
 * Component property GET
 * Example: Button1.Text
 */
function parsePropertyGet(block) {
    return {
        kind: "PropertyGet",
        component:
            block.fields?.COMPONENT_SELECTOR ||
            block.mutation?.instance_name ||
            "unknown_component",

        property:
            block.fields?.PROP ||
            block.mutation?.property_name ||
            "unknown_property"
    };
}

/**
 * Component property SET
 * Example: set Button1.Text to "Hello"
 */

function parsePropertySet(block) {
    return {
        kind: "PropertySet",

        component:
            block.fields?.COMPONENT_SELECTOR ||
            block.mutation?.instance_name ||
            "unknown_component",

        property:
            block.fields?.PROP ||
            block.mutation?.property_name ||
            "unknown_property",

        value:
            block.values?.VALUE?.block
                ? parseBlock(block.values.VALUE.block)
                : null
    };
}

/**
 * Component method call
 * Example: Button1.Click()
 */
function parseMethodCall(block) {
    const args = [];

    let i = 0;

    while (block.values?.[`ARG${i}`]) {

        const raw =
            block.values[`ARG${i}`].block;

        args.push(
            raw ? parseBlock(raw) : null
        );

        i++;
    }

    return {
        kind: "MethodCall",
        component:
            block.mutation?.instance_name ||
            block.fields?.COMPONENT,

        method:
            block.mutation?.method_name ||
            "unknown_method",

        args
    };
}

/**
 * Generic component method (dynamic component)
 * Example: Any Button / ListView / dynamic component
 */

function parseGenericMethod(block) {
    const args = [];

    let i = 0;
    while (block.values?.[`ARG${i}`]) {

        const raw = block.values[`ARG${i}`].block;

        args.push(raw ? parseBlock(raw) : null);

        i++;
    }

    return {
        kind: "GenericMethodCall",

        component: block.values?.COMPONENT?.block
            ? parseBlock(block.values.COMPONENT.block)
            : null,

        method: block.mutation?.method_name || "unknown_method",

        args
    };
}

/**
 * Register all component-related blocks
 */
register("component_component_block", parseComponent);
register("component_set_get", (block) => {
    const mode = block.mutation?.set_or_get;

    if (mode === "get") {
        return parsePropertyGet(block);
    }
    return parsePropertySet(block);
});

register("component_method", parseMethodCall);
register("component_all_component_block", parseGenericMethod);