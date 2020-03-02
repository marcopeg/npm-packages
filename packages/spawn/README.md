# @marcopeg/spawn

An async wrapper around `child_process.spawn` with a rich API to control the spawned process.

```js
const spawn = require("@marcopeg/spawn");
const p1 = spawn("echo 123");
const r1 = await p1;
console.log(r1.stdout[0]);
// -> 123
```

For more examples take a look at [the unit tests](./index.test.js)
