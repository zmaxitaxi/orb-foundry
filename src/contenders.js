export function normalizeContenderIds(value, registry, fallback = []) {
    const source = Array.isArray(value) ? value : fallback;
    const unique = [...new Set(source.filter((id) => registry[id]))];
    if (unique.length >= 2) return unique;
    return [...new Set([...unique, ...fallback, ...Object.keys(registry)])].slice(0, 2);
}

export function selectContenderIds(value, registry, count = 2, seed = 1, fallback = []) {
    const contenders = normalizeContenderIds(value, registry, fallback);
    if (contenders.length <= count) return contenders.slice(0, count);
    const shuffled = [...contenders];
    let state = (Number(seed) >>> 0) || 1;
    const random = () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const other = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled.slice(0, count);
}
