## Contributors

By @dianmorales

Retrieve a list of contributors and a number of total contributions made to the differents repositories of the selected Organization
import contributors from '@dianmora/contributors';

### Example

```
import fs from 'fs/promises';
import path from 'path';

const token = process.env.TOKEN;
const contributors = require('@dianmora/contributors');
const excludebots = ['foo'];

(async () => {
  try {
    const result = await contributors({
      token: token,
      organization: 'org',
      excludebots,
      allowFork: false,
      allowPrivateRepo: false,
    });
    await fs.writeFile('./foo.json', JSON.stringify(result, null, 4));
  } catch (err) {
    console.error('error on update', err);
    process.exit(1);
  }
})();
```

MIT
