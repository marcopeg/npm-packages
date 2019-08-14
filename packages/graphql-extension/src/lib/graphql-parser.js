import { GraphQLID, GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql'
import { GraphQLNonNull, GraphQLList } from 'graphql'
import { GraphQLObjectType, GraphQLInputObjectType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

import createFetchResolver from 'fetch-resolver'

const getTypeName = (name, options = {}) =>
    options.alias ? `${options.alias}__${name}` : name

const parseQueryResolver = (name, field, source, options, config) => {
    if (typeof source === 'function') {
        return source
    }

    // @TODO: hooks or config to inject some validation or limitation logic?
    const resolveFn = createFetchResolver(source)

    return async (root, args, context, info) => {
        const variables = {
            ...(config.variables || {}),
            root,
            args
        }

        // integration point with the hooks
        if (options.hooks) {
            await options.hooks.createHook.serie('GRAPHQL_EXTENSION_RESOLVE', {
                extension: name,
                method: field,
                type: options.rootType,
                source,
                graphql: { root, args, context, info },
                variables,
            })
        }

        return resolveFn(variables)
    }
}
const parseExtensionResolver = (source) => {
    if (source === true) {
        return (_, args) => args
    }

    return typeof source === 'function'
        ? source
        : null
}

export const parseField = (receivedInput, types, options) => {
    const input = receivedInput.trim()

    if (input[input.length - 1] === '!') {
        const type = parseField(input.substr(0, input.length - 1), types, options)
        return new GraphQLNonNull(type)
    }

    if (input[0] === '[' && input[input.length - 1] === ']') {
        const type = parseField(input.substr(1, input.length - 2), types, options)
        return new GraphQLList(type)
    }

    switch (input) {
        case 'ID':
            return GraphQLID
        case 'Int':
            return GraphQLInt
        case 'Float':
            return GraphQLFloat
        case 'String':
            return GraphQLString
        case 'Boolean':
            return GraphQLBoolean
        case 'JSON':
            return GraphQLJSON
        default:
            return types[getTypeName(input, options)] || types[input]
    }
}

export const parseObject = (def, types, options) => {
    const { name, description, fields } = def
    const { __description, __type, ...realFields } = fields

    const addField = (acc, curr) => ({
        ...acc,
        [curr]: { type: parseField(realFields[curr], types, options) },
    })

    switch (__type) {
        case 'input':
            return new GraphQLInputObjectType({
                name: getTypeName(name, options),
                description: __description || description,
                fields: Object.keys(realFields).reduce(addField, {}),
            })
        default:
            return new GraphQLObjectType({
                name: getTypeName(name, options),
                description: __description || description,
                fields: Object.keys(realFields).reduce(addField, {}),
            })
    }
}

export const parseTypes = (types, options = {}) =>
    Object.keys(types).reduce((acc, curr) => ({
        ...acc,
        [getTypeName(curr, options)]: typeof types[curr] === 'string'
            ? parseField(types[curr], acc, options)
            : parseObject({
                name: curr,
                fields: types[curr],
            }, acc, options),
    }), options.types || {})

export const parseInputTypes = (types, options = {}) =>
    Object.keys(types).reduce((acc, curr) => ({
        ...acc,
        [getTypeName(curr, options)]: typeof types[curr] === 'string'
            ? parseField(types[curr], acc, options)
            : parseObject({
                name: curr,
                fields: {
                    __type: 'input',
                    ...types[curr],
                },
            }, acc, options),
    }), options.types || {})

export const parseEndpointArgs = (args, types, options) =>
    Object.keys(args).reduce((acc, curr) => ({
        ...acc,
        [curr]: {
            type: typeof args[curr] === 'string'
                ? parseField(args[curr], types, options)
                : parseObject({
                    name: curr,
                    fields: args[curr],
                }, types, options),
        },
    }), {})

export const parseEndpoints = (endpoints, types, options, config) =>
    Object.keys(endpoints).reduce((acc, curr) => {
        if (typeof endpoints[curr] === 'string') {
            return {
                ...acc,
                [curr]: { type: parseField(endpoints[curr], types, options) },
            }
        }

        const args = endpoints[curr].args
            ? parseEndpointArgs(endpoints[curr].args, types, options)
            : {}

        const type = typeof endpoints[curr].type === 'string'
            ? parseField(endpoints[curr].type, types, options)
            : parseObject({
                name: curr,
                fields: endpoints[curr].type,
            }, types, options)

        const resolve = endpoints[curr].resolve
            ? { resolve: parseQueryResolver(options.alias, curr, endpoints[curr].resolve, options, config) }
            : {}

        return {
            ...acc,
            [curr]: {
                args,
                type,
                ...resolve,
            },
        }
    }, {})

export const parseExtension = (config, options = {}) => {
    options.alias = config.name

    const types = {
        ...parseInputTypes(config.inputTypes || {}, options),
        ...parseTypes(config.types || {}, options),
    }

    // extract the wrapper definition from queries and mutations
    const { __wrapper__: queriesWrapper, ...queries } = config.queries || {}
    const { __wrapper__: mutationsWrapper, ...mutations } = config.mutations || {}

    return {
        queries: Object.keys(queries).length
            ? {
                [config.name]: {
                    ...(config.shouldRunQueries
                        ? { resolve: parseExtensionResolver(config.shouldRunQueries) }
                        : {}
                    ),
                    ...(queriesWrapper && queriesWrapper.args ? {
                        args: parseEndpointArgs(queriesWrapper.args, types, {
                            ...options,
                            rootType: 'query'
                        })
                    } : {}),
                    type: new GraphQLObjectType({
                        name: `${config.name}Query`,
                        fields: parseEndpoints(queries, types, {
                            ...options,
                            rootType: 'query'
                        }, config),
                    }),
                },
            }
            : {},
        mutations: Object.keys(mutations).length
            ? {
                [config.name]: {
                    ...(config.shouldRunMutations
                        ? { resolve: parseExtensionResolver(config.shouldRunMutations) }
                        : {}
                    ),
                    ...(mutationsWrapper && mutationsWrapper.args ? {
                        args: parseEndpointArgs(mutationsWrapper.args, types, {
                            ...options,
                            rootType: 'mutation'
                        })
                    } : {}),
                    type: new GraphQLObjectType({
                        name: `${config.name}Mutation`,
                        fields: parseEndpoints(mutations, types, {
                            ...options,
                            rootType: 'mutation'
                        }, config),
                    }),
                },
            }
            : {},
    }
}
