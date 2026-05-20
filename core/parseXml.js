export function parseXml(xmlContent) {

    const parser = new DOMParser();

    const xml =
        parser.parseFromString(
            xmlContent,
            "text/xml"
        );

    const rootBlocks =
        [...xml.children[0].children]
            .filter(x => x.tagName === "block");

    return rootBlocks.map(parseXmlBlock);
}



function parseXmlBlock(domBlock) {

    console.log("parsing block:", domBlock.getAttribute("type"));
    console.log("  direct children tags:", [...domBlock.children].map(c => c.tagName + "[" + c.getAttribute("name") + "]"));
    

    return {
        type:
            domBlock.getAttribute("type"),

        fields:
            extractFields(domBlock),

        values:
            extractValues(domBlock),

        statements:
            extractStatements(domBlock),

        mutation:
            extractMutation(domBlock),

        next:
            extractNext(domBlock)
    };
}



function extractFields(block) {

    const obj = {};

    block
        .querySelectorAll(":scope > field")
        .forEach(f => {

            obj[
                f.getAttribute("name")
            ] = f.textContent;
        });

    return obj;
}



function extractValues(block) {

    const obj = {};

    block
        .querySelectorAll(":scope > value")
        .forEach(v => {

            const child =
                v.querySelector(":scope > block");

            obj[
                v.getAttribute("name")
            ] = {

                block:
                    child
                        ? parseXmlBlock(child)
                        : null
            };
        });

    return obj;
}



function extractStatements(block) {

    const obj = {};

    block
        .querySelectorAll(":scope > statement")
        .forEach(s => {

            const child =
                s.querySelector(":scope > block");

            obj[
                s.getAttribute("name")
            ] = {

                block:
                    child
                        ? parseXmlBlock(child)
                        : null
            };
        });

    return obj;
}



function extractNext(block) {

    const next =
        block.querySelector(
            ":scope > next > block"
        );

    if (!next) {
        return null;
    }

    return {
        block:
            parseXmlBlock(next)
    };
}



function extractMutation(block) {

    const m =
        block.querySelector(
            ":scope > mutation"
        );

    if (!m) {
        return {};
    }

    const obj = {};

    for (const attr of m.attributes) {
        obj[attr.name] = attr.value;
    }

    obj.args =
        [...m.querySelectorAll("arg")]
            .map(arg => ({
                name:
                    arg.getAttribute("name")
            }));

    return obj;
}