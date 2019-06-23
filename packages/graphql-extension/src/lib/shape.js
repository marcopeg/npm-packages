
import { dotted } from './dotted'

export const shape = (data, tpl) => {
    if (!tpl) {
        return data
    }

    const res = {}
    Object.keys(tpl).forEach(key => {
        // parse string references or templates
        if (typeof tpl[key] === 'string') {
            const dataValue = data[key]
            if (dataValue !== undefined) {
                res[key] = data[key]
                return
            }

            try {
                const dottedValue = dotted(data, tpl[key])
                if (dottedValue !== undefined) {
                    res[key] = dottedValue
                    return
                }
            } catch (err) {}

            // parses moustache-like values inside the origin as text
            res[key] = tpl[key].replace(/\{\{(.+?)\}\}/g, (_, v) => dotted(data, v.trim()))
            return
        }

        // works on array
        // [[ TO DO ]]

        // parses nested objects
        res[key] = shape(data, tpl[key])
    })

    return res
}
