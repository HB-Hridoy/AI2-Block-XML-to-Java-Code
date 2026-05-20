import { registerEmitter } from "../../registry/emitters.js";
import { emit } from "../../core/emit.js";


registerEmitter("Component", node => {
    return `GetComponentByName("${node.name}")`;
});


registerEmitter("AllComponent", node => {
    return `GetComponentsByType("${node.type}")`;
});


registerEmitter("PropertyGet", node => {

    return `GetProperty(
        GetComponentByName("${node.component}"),
        "${node.property}"
    )`
    .replace(/\n\s+/g, " ");
});


registerEmitter("PropertySet", node => {

    return `SetProperty(
        GetComponentByName("${node.component}"),
        "${node.property}",
        ${emit(node.value)}
    );`
    .replace(/\n\s+/g, " ");
});


registerEmitter("GenericPropertyGet", node => {

    return `GetProperty(
        ${emit(node.component)},
        "${node.property}"
    )`
    .replace(/\n\s+/g, " ");
});


registerEmitter("GenericPropertySet", node => {

    return `SetProperty(
        ${emit(node.component)},
        "${node.property}",
        ${emit(node.value)}
    );`
    .replace(/\n\s+/g, " ");
});


registerEmitter("MethodCall", node => {

    const args =
        node.args
            .map(emit)
            .join(", ");

    return `Invoke(
        GetComponentByName("${node.component}"),
        "${node.method}",
        new Object[]{${args}}
    );`
    .replace(/\n\s+/g, " ");
});


registerEmitter("GenericMethodCall", node => {

    const args =
        node.args
            .map(emit)
            .join(", ");

    return `Invoke(
        ${emit(node.component)},
        "${node.method}",
        new Object[]{${args}}
    );`
    .replace(/\n\s+/g, " ");
});


registerEmitter("Event", node => {

    const body =
        node.body
            .map(emit)
            .join("\n");

    const target =
        node.isGeneric
            ? node.component
            : `"${node.component}"`;

    return `// Event ${target}.${node.event}
{
${body}
}`;
});