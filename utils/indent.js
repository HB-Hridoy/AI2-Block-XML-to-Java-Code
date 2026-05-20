export function indent(code, level = 1) {
    return code
        .split("\n")
        .map(l => "    ".repeat(level) + l)
        .join("\n");
}