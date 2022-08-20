import { describe, expect, test } from "vitest";
import nock from "nock";
import contributors from "../src";

const repositoryApiUrl = `/orgs/organization1/repos?per_page=100`;
const repositoryContributorsPageApiUrl = (repositoryName, pageNumber) =>
  `/repos/organization1/${repositoryName}/contributors?anon=true&per_page=100&page=${pageNumber}`;

test("repositories test", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 6,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(1);
}, 100);

test("contributors test exclude bots", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
      {
        name: "repository2",
        full_name: "organization1/repository2",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository2",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 4,
      },
      {
        login: "user3",
        contributions: 20,
        id: 252525,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, [])
    .get(repositoryContributorsPageApiUrl("repository2", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 4,
      },
      {
        login: "user-bot",
        id: 453621,
        contributions: 3,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository2", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: ["user-bot"],
  });
  expect(listContributors).toHaveLength(2);
  expect(listContributors[0].login).not.toBe("user-bot");
  expect(listContributors[1].login).not.toBe("user-bot");
}, 100);

test("Sum of all Contributions and sorted Desc", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
      {
        name: "repository2",
        full_name: "organization1/repository2",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository2",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 4,
      },
      {
        login: "user2",
        contributions: 20,
        id: 252525,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, [])
    .get(repositoryContributorsPageApiUrl("repository2", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 15,
      },
      {
        login: "user-bot",
        id: 453621,
        contributions: 3,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository2", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: ["user-bot"],
  });
  expect(listContributors).toHaveLength(2);
  expect(listContributors[0].login).toBe("user2");
  expect(listContributors[0].contributions).toBe(20);
  expect(listContributors[1].login).toBe("user1");
  expect(listContributors[1].contributions).toBe(19);
}, 100);

test("Group repositories by contributor", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
      {
        name: "repository2",
        full_name: "organization1/repository2",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository2",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 4,
      },
      {
        login: "user2",
        contributions: 20,
        id: 252525,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, [])
    .get(repositoryContributorsPageApiUrl("repository2", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 15,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository2", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });

  expect(listContributors).toHaveLength(2);
  expect(listContributors[0].login).toBe("user2");
  expect(listContributors[0].repositories.length).toBe(1);
  expect(listContributors[0].repositories[0].name).toBe("repository1");

  expect(listContributors[1].login).toBe("user1");
  expect(listContributors[1].repositories.length).toBe(2);
  expect(listContributors[1].repositories[0].name).toBe("repository2");
  expect(listContributors[1].repositories[1].name).toBe("repository1");
}, 100);

test("Sort repositories by number of contributions desc", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
      {
        name: "repository2",
        full_name: "organization1/repository2",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository2",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 4,
      },
      {
        login: "user2",
        contributions: 10,
        id: 252525,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, [])
    .get(repositoryContributorsPageApiUrl("repository2", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 15,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository2", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(2);
  expect(listContributors[0].login).toBe("user1");
  expect(listContributors[0].repositories.length).toBe(2);
  expect(listContributors[0].repositories[0].contributions).toBe(15);
  expect(listContributors[0].repositories[1].contributions).toBe(4);

  expect(listContributors[1].login).toBe("user2");
  expect(listContributors[1].repositories.length).toBe(1);
  expect(listContributors[1].repositories[0].contributions).toBe(10);
}, 100);

test("test Contributors properties", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 120,
        watchers_count: 10,
        archived: false,
        watchers: 10,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 44,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, []);

  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(1);
  expect(listContributors[0].login).toBe("user1");
  expect(listContributors[0].id).toBe(558752);
  expect(listContributors[0].contributions).toBe(44);
  expect(listContributors[0].repositories.length).toBe(1);
  expect(listContributors[0].repositories[0].name).toBe("repository1");
  expect(listContributors[0].repositories[0].contributions).toBe(44);
  expect(listContributors[0].repositories[0].full_name).toBe(
    "organization1/repository1"
  );
  expect(listContributors[0].repositories[0].html_url).toBe(
    "https://github.com/organization1/repository1"
  );
  expect(listContributors[0].repositories[0].description).toBe(
    "📦🔐A lightweight private proxy registry build in Node.js"
  );
  expect(listContributors[0].repositories[0].watchers).toBe(10);
  expect(listContributors[0].repositories[0].staergezers).toBe(120);
  expect(listContributors[0].repositories[0].archived).toBeFalsy();
}, 100);

test("test repositories without contributors", async () => {
  nock("https://api.github.com")
    .get("/orgs/organization1/repos?per_page=100")
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 120,
        watchers_count: 10,
        archived: false,
        watchers: 10,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, []);

  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(0);
}, 100);

test("repositories test", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 6,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(1);
}, 100);

test("repositories test", async () => {
  nock("https://api.github.com")
    .get(repositoryApiUrl)
    .reply(200, [
      {
        name: "repository1",
        full_name: "organization1/repository1",
        owner: {
          login: "organization1",
        },
        html_url: "https://github.com/organization1/repository1",
        description:
          "📦🔐A lightweight private proxy registry build in Node.js",
        stargazers_count: 11079,
        watchers_count: 11079,
        archived: false,
        watchers: 11079,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 1))
    .reply(200, [
      {
        login: "user1",
        id: 558752,
        contributions: 6,
      },
    ])
    .get(repositoryContributorsPageApiUrl("repository1", 2))
    .reply(200, []);
  const listContributors = await contributors({
    token: "12345",
    organization: "organization1",
    excludebots: [],
  });
  expect(listContributors).toHaveLength(1);
}, 100);
