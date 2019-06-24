# @marcopeg/dotted

Extract data from an object using a dotted notation.

```js
import dotted from '@marcopeg/dotted'

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

dotted(data, 'name')
// -> marco

dotted(data, 'family.father.name')
// -> piero

dotted(data, 'family.siblings.$0.name')
// -> giulia

dotted(data, 'family.siblings.$LENGTH')
// -> 2

dotted(data, 'family.siblings.$FIRST.name')
// -> giulia

dotted(data, 'family.siblings.$LAST.name')
// -> elisa
```
