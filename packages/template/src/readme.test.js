import template from './index'

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
        expect(template('name', data)).toBe('marco')
    })
    test('example 002', () => {
        expect(template('{{ name }} {{ surname }}', data)).toBe('marco pegoraro')
    })
    test('example 003', () => {
        const res = template('{{ name }} {{ surname }} has {{ family.siblings.$LENGTH }} siblings', data)
        expect(res).toBe('marco pegoraro has 2 siblings')
    })
})
