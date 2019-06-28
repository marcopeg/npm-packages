import { dotted } from './dotted'

describe('dottedSet', () => {
    test('it should return just the value for scalar sources', () => {
        expect(dotted.set(1, 'foo', 2)).toBe(2)
        expect(dotted.set('a', 'foo', 'b')).toBe('b')
        expect(dotted.set(true, 'foo', false)).toBe(false)
        expect(dotted.set(null, 'foo', 1)).toEqual({ foo: 1 })
        expect(dotted.set(undefined, 'foo', 1)).toEqual({ foo: 1 })
    })

    test('it should set a first level variable', () => {
        expect(dotted.set({}, 'foo', 1)).toEqual({ foo: 1 })
    })

    test('it should set nested values', () => {
        const source = { foo: { faa: 1 }}
        dotted.set(source, 'foo.faa', 2)
        expect(source.foo.faa).toBe(2)
    })

    test('it should set nested values with missing layers', () => {
        const res = dotted.set({}, 'foo.faa.fii', 1)
        expect(res.foo.faa.fii).toBe(1)
    })

    test('it should work as immutable', () => {
        const source = { foo: { faa: 1 } }
        const res = dotted.set.immutable(source, 'foo.faa', 2)
        expect(source).not.toBe(res)
        expect(res.foo.faa).toBe(2)
    })
})
