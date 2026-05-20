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



registerEmitter("CtrlIf", node => {

    let output = "";

    for (let i = 0; i < node.conditions.length; i++) {

        const condition =
            emit(node.conditions[i]);

        const body =
            emitBody(node.bodies[i]);

        if (i === 0) {

            output +=
`if (${condition}) {
${body}
}`;
        }
        else {

            output +=
` else if (${condition}) {
${body}
}`;
        }
    }

    if (node.elseBody?.length) {

        const body =
            emitBody(node.elseBody);

        output +=
` else {
${body}
}`;
    }

    return output;
});



registerEmitter("CtrlForRange", node => {

    const start =
        emit(node.start);

    const end =
        emit(node.end);

    const step =
        emit(node.step);

    const body =
        emitBody(node.body);

    return
`for (int ${node.varName} = ${start}; ${node.varName} <= ${end}; ${node.varName} += ${step}) {
${body}
}`;
});



registerEmitter("CtrlForEach", node => {

    const list =
        emit(node.list);

    const body =
        emitBody(node.body);

    return
`for (Object ${node.varName} : ${list}) {
${body}
}`;
});



registerEmitter("CtrlForEachDict", node => {

    const dict =
        emit(node.dict);

    const body =
        emitBody(node.body);

    return
`for (Map.Entry<Object,Object> entry : ${dict}.entrySet()) {

    Object ${node.keyName} = entry.getKey();
    Object ${node.valueName} = entry.getValue();

${body}
}`;
});



registerEmitter("CtrlWhile", node => {

    const condition =
        emit(node.condition);

    const body =
        emitBody(node.body);

    return
`while (${condition}) {
${body}
}`;
});



registerEmitter("CtrlChoose", node => {

    return
`(${emit(node.condition)}
    ? ${emit(node.then)}
    : ${emit(node.else)})`;
});



registerEmitter("CtrlDo", node => {

    const body =
        emitBody(node.body);

    const result =
        emit(node.result);

    return
`(() -> {
${body}
    return ${result};
})()`;
});



registerEmitter("CtrlBreak", () => {
    return "break;";
});



registerEmitter("CtrlMethod", node => {

    const args =
        (node.args || [])
            .map(emit)
            .join(", ");

    return `${node.operation}(${args});`;
});