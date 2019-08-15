/**
 * Rules that explain how to use a particular response
 * 
 * [
 *   {
 *     "match": [ "status", [200] ],
 *     "apply": [ "json", "grab.from.json", { id: '{{res.id}}' } ]
 *   },
 *   {
 *     "match": [ "status", [ 400, 404 ] ],
 *     "apply": [ "throw", "custom error  -{{ res.statusText }}" ]
 *   },
 *   {
 *     "match": [ "status", [ 400, 404 ] ],
 *     "apply": [ "res2json", { err: true, status: 'res.status', msg: '{{ text }}' } ]
 *   },
 * ]
 */

import dotted from '@marcopeg/dotted'
import template from '@marcopeg/template'

const ruleMatcher = {
    // used for the fallback rule
    all: () => true,
    // matches the status code against a list of possible options
    status: ({ rule, res }) => rule.match[1].includes(res.status),
    statusError: ({ rule, res }) => res.status >= 400,
}

const ruleApply = {
    // parse response's JSON and apply "grab" and "shape" to it
    json: async ({ rule, res }) => {
        const data = await res.json()
        return rule.apply[2]
            ? template(rule.apply[2], dotted(data, rule.apply[1]))
            : dotted(data, rule.apply[1])
    },
    // throws errors based on a template string
    throw: ({ rule, res }) => {
        throw new Error(template(rule.apply[1], { res }))
    },
    // transforms a response info into json
    res2json: async ({ rule, res }) => {
        const text = await res.text()
        return template(rule.apply[1], { res, text })
    },
    statusError: ({ rule, res }) => ({ err: `${res.status} ${res.statusText}` }),
    // yeah... just return some plain values out of the rule
    value: ({ rule }) => rule.apply[1],
}

export const applyRules = (config, res) => {
    const rules = [
        ...(config.rules || []),
        {
            match: [ 'all' ],
            apply: [ 'json', config.grab, config.shape ]
        }
    ]

    // Identify the correct rule
    const rule = rules.find(rule => {
        const matcher = ruleMatcher[rule.match[0]]
        if (!matcher || !matcher({ config, rule, res })) return false
        return true
    })

    // Identify the correct applier
    const apply = ruleApply[rule.apply[0]]
    if (!apply) throw new Error(`Unexpected apply "${rule.apply[0]}" for the rule "${rule.match[0]}"`)

    return apply({ config, rule, res })
}
