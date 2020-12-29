const contributors = require('../src');

test('contributors length', async () => {
  const listContributors = await contributors();
  expect(listContributors).toHaveLength(218);
}, 30000);
