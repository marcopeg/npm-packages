import { shape } from './shape'

describe('shape', () => {
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
        expect(shape(source)).toBe(source)
    })

    test('it should grab first level properties', () => {
        expect(shape(source, { name: 'name', age: 'age' })).toEqual({ name: 'marco', age: 38 })
    })
    
    test('it should grab dotted properties', () => {
        expect(shape(source, { foo: 'family.father.name'})).toEqual({ foo: 'piero' })
    })

    test('it should parse string templates', () => {
        expect(shape(source, { foo: '{{name}}, {{ age }}'})).toEqual({ foo: 'marco, 38' })
    })

    test('it should work on nested objects', () => {
        expect(shape(source, {
            name: 'name',
            meta: {
                age: 'age',
                father: 'family.father.name',
                mother: '{{ family.mother.name }}',
                hobby1: 'hobbies.$0',
                hobby2: '{{ hobbies.$1 }}',
            }
        })).toEqual({
            name: 'marco',
            meta: {
                age: 38,
                father: 'piero',
                mother: 'teresa',
                hobby1: 'paragliding',
                hobby2: 'sailing',
            },
        })
    })
})
