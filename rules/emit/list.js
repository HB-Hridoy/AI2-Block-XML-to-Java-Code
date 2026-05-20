import { registerEmitter } from "../../registry/emitters.js";
import { emit } from "../../core/emit.js";


function emitBody(body = [], indent = "    ") {

    return body
        .map(node => {

            return emit(node)
                .split("\n")
                .map(line => indent + line)
                .join("\n");

        })
        .join("\n");
}



registerEmitter("MakeList", node => {

    const elements =
        node.elements
            .map(emit)
            .join(", ");

    return `YailList.makeList(new Object[]{${elements}})`;
});



registerEmitter("ListMethod", node => {

    const list =
        emit(node.list);

    const args =
        (node.args || [])
            .map(emit)
            .join(", ");

    return `${list}.${node.operation}(${args})`;
});



registerEmitter("ListProperty", node => {

    const list =
        emit(node.list);

    return `${list}.${node.property}()`;
});



registerEmitter("ListFunction", node => {

    const args =
        (node.args || [])
            .map(emit)
            .join(", ");

    return `${node.function}(${args})`;
});



registerEmitter("ListGet", node => {

    return `${emit(node.list)}.get(${emit(node.index)})`;
});



registerEmitter("ListSet", node => {

    return `${emit(node.list)}.set(
        ${emit(node.index)},
        ${emit(node.element)}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("ListMap", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.to);

    return `${list}.map((${node.asName}) -> ${expr})`;
});



registerEmitter("ListFilter", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.test);

    return `${list}.filter((${node.asName}) -> ${expr})`;
});



registerEmitter("ListReduce", node => {

    const list =
        emit(node.list);

    const init =
        emit(node.initExpr);

    const expr =
        emit(node.applyExpr);

    return `${list}.reduce(
        ${init},
        (${node.ansSoFarName}, ${node.itemName}) -> ${expr}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("ListSort", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.testExpr);

    return `${list}.sort(
        (${node.firstItemName}, ${node.secondItemName}) -> ${expr}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("ListSortKey", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.applyExpr);

    return `${list}.sortBy(
        (${node.keyName}) -> ${expr}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("ListTransMin", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.testExpr);

    return `${list}.min(
        (${node.firstItemName}, ${node.secondItemName}) -> ${expr}
    )`
    .replace(/\n\s+/g, " ");
});



registerEmitter("ListTransMax", node => {

    const list =
        emit(node.list);

    const expr =
        emit(node.testExpr);

    return `${list}.max(
        (${node.firstItemName}, ${node.secondItemName}) -> ${expr}
    )`
    .replace(/\n\s+/g, " ");
});

registerEmitter("ListFromCsvRow", node => {

    const args =
        (node.args || [])
            .map(arg => emit(arg))
            .join(", ");

    return `listFromCsvRow(${args})`;
});