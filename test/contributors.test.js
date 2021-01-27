const contributors = require('../src');
const nock = require('nock');

test('repositories test', async () => {
  nock('https://api.github.com')
      .get('/orgs/organization1/repos?per_page=100')
      .reply(200, [
        {
          name: 'repository1',
          full_name: 'organization1/repository1',
          owner: {
            login: 'organization1',
          },
          html_url: 'https://github.com/organization1/repository1',
          description: '📦🔐A lightweight private proxy registry build in Node.js',
          stargazers_count: 11079,
          watchers_count: 11079,
          archived: false,
          watchers: 11079,
        }])
      .get('/repos/organization1/repository1/contributors?anon=true&per_page=500')
      .reply(200, [
        {
          login: 'user1',
          id: 558752,
          contributions: 6,
        },
      ]);
  const listContributors = await contributors('12345', 'organization1', []);
  expect(listContributors).toHaveLength(1);
}, 30000);


test('contributors test exclude bots', async () => {
  nock('https://api.github.com')
      .get('/orgs/organization1/repos?per_page=100')
      .reply(200, [
        {
          name: 'repository1',
          full_name: 'organization1/repository1',
          owner: {
            login: 'organization1',
          },
          html_url: 'https://github.com/organization1/repository1',
          description: '📦🔐A lightweight private proxy registry build in Node.js',
          stargazers_count: 11079,
          watchers_count: 11079,
          archived: false,
          watchers: 11079,
        },
        {
          name: 'repository2',
          full_name: 'organization1/repository2',
          owner: {
            login: 'organization1',
          },
          html_url: 'https://github.com/organization1/repository2',
          description: '📦🔐A lightweight private proxy registry build in Node.js',
          stargazers_count: 11079,
          watchers_count: 11079,
          archived: false,
          watchers: 11079,
        },
      ])
      .get('/repos/organization1/repository1/contributors?anon=true&per_page=500')
      .reply(200, [
        {
          login: 'user1',
          id: 558752,
          contributions: 4,
        },
        {
          login: 'user3',
          contributions: 20,
          id: 252525,
        },
      ])
      .get('/repos/organization1/repository2/contributors?anon=true&per_page=500')
      .reply(200, [
        {
          login: 'user1',
          id: 558752,
          contributions: 4,
        },
        {
          login: 'user-bot',
          id: 453621,
          contributions: 3,
        },
      ]);
  const listContributors = await contributors('12345', 'organization1', ['user-bot']);
  expect(listContributors).toHaveLength(2);
}, 30000);