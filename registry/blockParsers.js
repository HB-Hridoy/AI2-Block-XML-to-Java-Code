export const PARSERS = new Map();

export function register(type, fn) {
    PARSERS.set(type, fn);
}