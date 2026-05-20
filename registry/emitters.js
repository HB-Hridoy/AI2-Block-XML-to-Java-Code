export const EMITTERS = new Map();

export function registerEmitter(type, fn) {
    EMITTERS.set(type, fn);
}