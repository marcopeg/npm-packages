/**
 * Minimalistic Interface to Dot-Access an Object
 *
 */

export const dotted = (source, path) => {
    if (!path) {
        return source
    }

    // const res = JSON.parse(JSON.stringify(source))

    return path.split('.').reduce((curr, key) => {
        if (key[0] !== '$') {
            return curr[key]
        }

        if (key === '$JSON') {
            return JSON.stringify(curr)
        }

        if (Array.isArray(curr)) {
            const idx = parseInt(key.substr(1, key.length), 10)
            return curr[idx]
        }
    }, source)
}
