# deeplog

Console logs formatted JSON:

```js
import deeplog from 'deeplog';
deeplog({ foo: 123 });
deeplog.warn({ foo: 123 });
deeplog.error({ foo: 123 });

import { deepLog, deepWarn, deepError } from 'deeplog';
deepLog({ foo: 123 });
deepWarn({ foo: 123 });
deepError({ foo: 123 });
```
