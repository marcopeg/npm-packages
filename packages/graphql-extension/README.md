# graphql-extension

Helps parsing JSON definition of a portion of a GraphQL schema.

```js
import { parseExtension } from 'graphql-extension'

// create an extension
const extension = parseExtension({
    "name": "Typicode",
    "variables": {
        "baseUrl": "https://jsonplaceholder.typicode.com",
    },
    "types": {
        "User": {
            "id": "ID!",
            "name": "String"
        }
    },
    "inputTypes": {
        "UserInput": {
            "name": "String!"
        }
    },
    "queries": {
        "users": {
            "type": "[User]",
            "resolve": {
                "type": "rest",
                "url": "{{ baseUrl }}/users"
            }
        },
        "user": {
            "type": "User",
            "args": {
                "id": "ID!"
            },
            "resolve": {
                "type": "rest",
                "url": "{{ baseUrl }}/users/{{id}}"
            }
        }
    },
    "mutations": {
        "addUser": {
            "type": "User",
            "args": {
                "user": "UserInput!"
            },
            "resolve": {
                "type": "rest",
                "method": "post",
                "url": "{{ baseUrl }}/users",
                "headers": {
                    "Content-type": "application/json; charset=UTF-8"
                },
                "body": {
                    "name": "{{user.name}}"
                }
            }
        }
    },
    "shouldRunQueries": true,
    "shouldRunMutations": true
})

// Add the name spaced fields to your root query and mutations
// extension.queries.${extension.name}
// extension.mutations.${extension.name}
```
