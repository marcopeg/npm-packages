/**
 * Mini mustache-like templating library that operates variable substitution
 * in strings, arrays and objects.
 */

import dotted from '@marcopeg/dotted'

export const template = (tpl, variables) => {
    if (!variables || [ 'boolean', 'number' ].includes(typeof tpl)) {
        return tpl
    }

    // work on sttring templates
    if (typeof tpl === 'string') {
        // reference
        const dataValue = variables[tpl]
        if (dataValue !== undefined) {
            return dataValue
        }

        // unwrapped template
        try {
            const dottedValue = dotted(variables, tpl)
            if (dottedValue !== undefined) {
                return dottedValue
            }
        } catch (err) {}

        // wrapped template
        return tpl
            .replace(/\{\{\{(.+?)\}\}\}/g, (_, v) => encodeURIComponent(dotted(variables, v.trim())))
            .replace(/\{\{(.+?)\}\}/g, (_, v) => dotted(variables, v.trim()))
    }

    // works on array
    if (Array.isArray(tpl))
    return tpl.map(v => template(v, variables))

    // work on nested objects
    const res = {}
    Object.keys(tpl).forEach(key => res[key] = template(tpl[key], variables))

    return res
}
