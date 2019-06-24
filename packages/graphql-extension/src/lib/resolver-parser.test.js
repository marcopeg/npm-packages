import 'babel-polyfill'
import { resolverParser } from './resolver-parser'

describe('resolverParser()', () => {
    describe('REST', () => {
        test('it should parse a simple get request into data', async () => {
            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve([]),
            }))

            const resolve = resolverParser({
                type: 'rest',
                url: 'https://jsonplaceholder.typicode.com/users',
            })

            const res = await resolve()
            expect(res).toBeInstanceOf(Array)
        })

        test('it should inject parameters into the request url', async () => {
            const resolve = resolverParser({
                type: 'rest',
                url: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    id: parseInt(url.split('/').pop(), 10)
                }),
            }))

            const res = await resolve({ userId: 2 })
            expect(res.id).toBe(2)
        })

        test('it should POST a resource using all the variables', async () => {
            const resolve = resolverParser({
                type: 'rest',
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/posts',
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                body: {
                    title: '{{title}}',
                    body: '{{body}}',
                    userId: '{{userId}}',
                },
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    ...JSON.parse(config.body),
                    id: 101,
                }),
            }))

            const res = await resolve({
                title: 'foo',
                body: 'bar',
                userId: '1',
            })

            expect(res).toEqual({
                title: 'foo',
                body: 'bar',
                userId: '1',
                id: 101,
            })
        })

        test('it should POST with different variables', async () => {
            const config = {
                type: 'rest',
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/users',
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                body: {
                    name: '{{name}}',
                },
            }

            const fetchMock = (url, config) => Promise.resolve({
                json: () => Promise.resolve({ name: JSON.parse(config.body).name }),
            })

            const resolve = resolverParser(config)

            jest.spyOn(global, 'fetch').mockImplementationOnce(fetchMock)
            const r1 = await resolve({ name: 'Marco' })

            jest.spyOn(global, 'fetch').mockImplementationOnce(fetchMock)
            const r2 = await resolve({ name: 'Luca' })

            expect(r1.name).toBe('Marco')
            expect(r2.name).toBe('Luca')
        })

        test('it should grab part of the response', async () => {
            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve([
                    { name: 'Clementine Bauch' },
                ]),
            }))

            const resolve = resolverParser({
                type: 'rest',
                url: 'https://jsonplaceholder.typicode.com/users',
                grab: '$0.name',
            })

            const res = await resolve()
            expect(res).toBe('Clementine Bauch')
        })

        test('it should re-shape the response', async () => {
            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve({
                    id: 1,
                    address: {
                        street: 'foo',
                        city: 'faa',
                    },
                }),
            }))

            const resolve = resolverParser({
                type: 'rest',
                url: 'https://jsonplaceholder.typicode.com/users/2',
                shape: {
                    id: 'id',
                    address: '{{ address.street }}, {{ address.city }}'
                },
            })

            const res = await resolve()

            expect(res).toEqual({
                id: 1,
                address: 'foo, faa',
            })
        })

        test('it should handle custom behaviors based on generic response conditions', async () => {
            const resolve = resolverParser({
                type: 'rest',
                url: 'https://app.mysocial.io/api/v1/auth/uname',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    _uname: 'mpe',
                },
                rules: [
                    {
                        match: [ 'status', [ 400, 404 ] ],
                        apply: [ 'throw', '{{ res.status }} {{ res.statusText }}' ]
                    }
                ],
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                status: 404,
                statusText: 'Username not found',
            }))

            try {
                await resolve()
            } catch (err) {
                expect(err.message).toBe('404 Username not found')
            }
        })

        test('it should convert a plain statusText into a JSON response', async () => {
            const resolve = resolverParser({
                type: 'rest',
                url: 'https://app.mysocial.io/api/v1/auth/uname',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    uname: 'mpeg13',
                },
                rules: [
                    {
                        match: [ 'status', [ 400, 404 ] ],
                        apply: [ 'res2json', { err: 'res.statusText' } ]
                    }
                ],
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                status: 404,
                statusText: 'Username not found',
                text: () => Promise.resolve('ok ok'),
            }))

            const res = await resolve()
            expect(res).toEqual({ err: 'Username not found' })
        })

        test('it should reshape a response to be just a boolean', async () => {
            const resolve = resolverParser({
                type: 'rest',
                url: 'https://app.mysocial.io/api/v1/auth/uname',
                rules: [
                    {
                        match: [ 'all', [ 400, 404 ] ],
                        apply: [ 'json', null, true ]
                    }
                ],
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ foo: 'aaa' }),
            }))

            const res = await resolve()
            expect(res).toBe(true)
        })

        test('it should reshape to null', async () => {
            const resolve = resolverParser({
                type: 'rest',
                url: 'https://app.mysocial.io/api/v1/auth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    uname: '{{uname}}',
                    passwd: '{{passwd}}'
                },
                rules: [
                    {
                        match: [ 'status', [ 422 ] ],
                        apply: [ 'throw', '{{ res.statusText }}' ]
                    },
                ],
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
                status: 422,
                statusText: 'foo',
            }))

            try {
                await resolve({ uname: 'foo', passwd: 'foo' })
            } catch (err) {
                expect(err.message).toBe('foo')
            }
        })
    })

    describe('GraphQL', () => {
        test('it should make a simple query', async () => {
            const resolve = resolverParser({
                type: 'graphql',
                url: 'https://countries.trevorblades.com/',
                query: '{ country (code: "IT") { code name phone currency }}',
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        country: {
                            code: 'IT',
                        },
                    },
                }),
            }))

            const res = await resolve()
            expect(res.data.country.code).toBe('IT')
        })

        test('it should make a simple query2', async () => {
            const resolve = resolverParser({
                type: 'graphql',
                url: 'https://countries.trevorblades.com/',
                query: '{ continents { code name }}',
                grab: 'data.continents',
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        continents: [{}],
                    },
                }),
            }))

            const res = await resolve()
            expect(res.length).toBe(1)
        })

        test('it should make queries with variables', async () => {
            const resolve = resolverParser({
                type: 'graphql',
                url: 'https://countries.trevorblades.com/',
                query: 'query foo ($code: String!) { country (code: $code) { code name phone currency }}',
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        country: {
                            code: JSON.parse(config.body).variables.code,
                        },
                    },
                }),
            }))

            const res = await resolve({ code: 'US' })
            expect(res.data.country.code).toBe('US')
        })

        test('it should grab part of the response', async () => {
            const resolve = resolverParser({
                type: 'graphql',
                url: 'https://countries.trevorblades.com/',
                query: 'query foo ($code: String!) { country (code: $code) { code name phone currency }}',
                grab: 'data.country.code',
            })

            jest.spyOn(global, 'fetch').mockImplementationOnce((url, config) => Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        country: {
                            code: JSON.parse(config.body).variables.code,
                        },
                    },
                }),
            }))

            const res = await resolve({ code: 'US' })
            expect(res).toBe('US')
        })
    })
})


