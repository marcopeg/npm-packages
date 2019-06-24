import 'babel-polyfill'
import createFetchResolver from '../index'

describe('README.md', () => {
    test('001', async () => {
        const resolver01 = createFetchResolver({
            type: 'rest',
            url: 'https://jsonplaceholder.typicode.com/users',
        })
        
        const res = await resolver01()
        expect(res).toBeInstanceOf(Array)
    })
    test('002', async () => {
        const resolver02 = createFetchResolver({
            type: 'rest',
            url: 'https://jsonplaceholder.typicode.com/users/{{ id }}',
            shape: {
                id: 'id',
                name: 'name',
                address: '{{ address.street }}, {{ address.city }}',
            }
        })
        
        const res = await resolver02({ id: 1 })
        expect(res).toHaveProperty('name')
    })
    test('003', async () => {
        const resolver03 = createFetchResolver({
            type: 'rest',
            url: 'https://jsonplaceholder.typicode.com/users/{{ id }}',
            headers: {
                'X-Origin': 'fetch-resolver',
                'X-RequestID': '{{ id }}',
            },
            grab: 'address',
            shape: {
                value: '{{ street }}, {{ city }}',
                loc: [ 'geo.lat', 'geo.lng' ],
            }
        })
        
        const res03 = await resolver03({ id: 1 })
        // console.log(res03)
    })
})
