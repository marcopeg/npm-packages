import dotted from './index'

const data = {
    name: 'marco',
    surname: 'pegoraro',
    family: {
        father: { name: 'piero' },
        mother: { name: 'teresa' },
        siblings: [
            { name: 'giulia' },
            { name: 'elisa' },
        ]
    }
}

describe('README.md', () => {
    test('example 001', () => {
        expect(dotted(data, 'name')).toBe('marco')
    })
    test('example 002', () => {
        expect(dotted(data, 'family.father.name')).toBe('piero')
    })
    test('example 003', () => {
        expect(dotted(data, 'family.siblings.$0.name')).toBe('giulia')
    })
    test('example 004', () => {
        expect(dotted(data, 'family.siblings.$LENGTH')).toBe(2)
    })
    test('example 005', () => {
        expect(dotted(data, 'family.siblings.$FIRST.name')).toBe('giulia')
    })
    test('example 006', () => {
        expect(dotted(data, 'family.siblings.$LAST.name')).toBe('elisa')
    })
})
