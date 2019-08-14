import 'isomorphic-fetch'
import clone from 'clone-deep'
import dotted from '@marcopeg/dotted'
import template from '@marcopeg/template'
import { applyRules } from './resolver-rules'


const resolverParserREST = (config) => async (variables) => {
    const fetchConfig = {
        method: (config.method || 'GET').toUpperCase(),
        headers: clone(config.headers || {}),
        body: clone(config.body || {}),
    }

    // handle variables in headers
    Object.keys(fetchConfig.headers).forEach(key => {
        fetchConfig.headers[key] = template(fetchConfig.headers[key], variables)
    })

    // handle variables in body
    Object.keys(fetchConfig.body).forEach(key => {
        if (typeof fetchConfig.body[key] === 'string') {
            fetchConfig.body[key] = template(fetchConfig.body[key], variables)
        }
    })
    fetchConfig.body = JSON.stringify(fetchConfig.body)

    // remove empty body - this was causing a big pain in the ass!!!
    // looks like there is an inconsistent behavior in ExpressJS when
    // a GET contains a "body" and the handler awaits a promise
    // https://github.com/expressjs/express/issues/4026
    if (fetchConfig.method === 'GET' || fetchConfig.body === '{}') {
        delete fetchConfig.body
    }

    const url = template(config.url, variables)
    const res = await fetch(url, fetchConfig)

    // improve error logging
    // if (res.status >= 400) {
    //     throw new Error(`${res.status} - ${res.statusText}`)
    // }

    return applyRules(config, res)
}

const resolverParserGQL = (config) => async (variables) => {
    const restConfig = {
        url: config.url,
        method: (config.method || 'POST').toUpperCase(),
        headers: {
            ...clone(config.headers || {}),
            'Content-type': 'application/json; charset=UTF-8',
        },
    }

    // handle variables in headers
    Object.keys(restConfig.headers).forEach(key => {
        restConfig.headers[key] = template(restConfig.headers[key], variables)
    })

    // build custom query variables from a template
    let queryVariables = null
    if (config.variables) {
        queryVariables = clone(config.variables)
        Object.keys(queryVariables).forEach(key => {
            queryVariables[key] = template(queryVariables[key], variables)
        })  
    }

    const restRequest = resolverParserREST({
        ...restConfig,
        body: {
            query: config.query,
            variables: queryVariables || variables,
        },
    })

    const res = await restRequest(variables)
    return config.shape
        ? template(config.shape, dotted(res, config.grab))
        : dotted(res, config.grab)
}

const parsers = {
    rest: resolverParserREST,
    graphql: resolverParserGQL,
}

export const resolverParser = (config) =>
    parsers[config.type](config)
