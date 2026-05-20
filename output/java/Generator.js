import { emit } from "../../core/emit.js";

export function generateJava(ast) {
  const body = ast.map((n) => emit(n)).join("\n");

  return `${body
    .split("\n")
    .map((l) => "   " + l)
    .join("\n")}`.trim();
}
