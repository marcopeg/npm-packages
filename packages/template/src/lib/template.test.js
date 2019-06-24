import { template } from './template'

describe('template', () => {
    const source = {
        name: 'marco',
        age: 38,
        hobbies: [ 'paragliding', 'sailing' ],
        family: {
            father: {
                name: 'piero',
            },
            mother: {
                name: 'teresa',
            },
        },
    }

    test('it should return the same input if nothing is passed', () => {
        expect(template(source)).toBe(source)
        expect(template('foo')).toBe('foo')
        expect(template(true)).toBe(true)
    })

    test('it should inject simple variable, mustache like', () => {
        expect(template('foo/{{uid}}', { uid: 'foo' })).toBe('foo/foo')
    })
    test('it should build a url with escaped contents', () => {
        const res = template('https://{{base}}/{{page}}?q={{{q}}}', {
            base: 'google.com',
            page: 'p1',
            q: 'foo::aaa',
        })

        expect(res).toBe('https://google.com/p1?q=foo%3A%3Aaaa')
    })

    test('it should use nested objects', () => {
        expect(template('{{foo.id}}', { foo: { id: 1 } })).toBe('1')
    })

    test('it should grab first level properties', () => {
        expect(template({ name: 'name', age: 'age' }, source)).toEqual({ name: 'marco', age: 38 })
    })
    
    test('it should grab dotted properties', () => {
        expect(template({ foo: 'family.father.name'}, source)).toEqual({ foo: 'piero' })
    })

    test('it should parse string templates', () => {
        expect(template({ foo: '{{name}}, {{ age }}'}, source)).toEqual({ foo: 'marco, 38' })
    })

    test('it should work on nested objects', () => {
        expect(template({
            name: 'name',
            meta: {
                age: 'age',
                father: 'family.father.name',
                mother: '{{ family.mother.name }}',
                hobby1: 'hobbies.$0',
                hobby2: '{{ hobbies.$1 }}',
            },
            hobbies: [ 'hobbies.$1', '{{ hobbies.$0 }}', 'foo'],
        }, source)).toEqual({
            name: 'marco',
            meta: {
                age: 38,
                father: 'piero',
                mother: 'teresa',
                hobby1: 'paragliding',
                hobby2: 'sailing',
            },
            hobbies: [ 'sailing', 'paragliding', 'foo' ],
        })
    })
})
