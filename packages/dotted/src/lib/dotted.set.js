
const scalars = [
    'number',
    'string',
    'boolean'
]

export const dottedSet = (source, path, value) => {
    if (scalars.includes(typeof source)) {
        return value
    }

    if (!source) {
        return dottedSet({}, path, value)
    }

    const tokens = path.split('.')
    const setKey = tokens.pop()
    
    // get a reference to the deeper layer represented by the path
    const target = tokens.reduce((curr, key) => {
        return curr[key] = curr[key] || {} 
    }, source)
    
    // set the value at the requested key level
    target[setKey] = value

    return source
}

dottedSet.immutable = (source, path, value) =>
    dottedSet(JSON.parse(JSON.stringify(source)), path, value)
