/* eslint-disable camelcase */
const {Octokit} = require('@octokit/rest');
const debug = require('debug')('contributors');
const RESULTS_MAX_PER_PAGE = 100;

// eslint-disable-next-line require-jsdoc
async function getRepositories(
    octokit,
    organization,
    allowFork,
    allowPrivateRepo,
) {
  const {data} = await octokit.repos.listForOrg({
    org: organization,
    per_page: RESULTS_MAX_PER_PAGE,
  });

  return data
      .filter((item) => {
        if (item.private) {
          debug('Repo %s is private', item.name);
          return allowPrivateRepo;
        }

        // if is not private, we always include it.
        return true;
      })
      .filter((item) => {
        if (item.fork) {
          debug('Repo %s is fork', item.name);
          return allowFork;
        }

        // all non fork are included
        return true;
      });
}

exports.getRepositories = getRepositories;

module.exports = async function({
  token,
  organization,
  excludebots = [],
  allowFork = true,
  allowPrivateRepo = true,
}) {
  const octokit = new Octokit({auth: token});
  // Repositories for an Organization
  const repositories = await getRepositories(
      octokit,
      organization,
      allowFork,
      allowPrivateRepo,
  );
  debug('repositories %o', repositories.length);
 
  const contributors = repositories.reduce(async (acc, currentValue) => {
    let collection = await acc;
    const {
      name,
      owner: {login},
      full_name,
      html_url,
      description,
      stargazers_count,
      watchers,
      archived,
    } = currentValue;
    debug('name %o', name);
    debug('login %o', login);
    debug('full_name %o', full_name);
    debug('filter bots: %o', excludebots);

    // Contributors by a specific repository
    const listContributors = [];
    let page = 1;
    while (true) {
      const result = await octokit.repos.listContributors({
        owner: login,
        repo: name,
        anon: true,
        page,
        per_page: RESULTS_MAX_PER_PAGE,
      });
      if (result.data.length > 0) {
        debug('%s new contributors found for %s', result.data.length, name);
        listContributors.push(...result.data);
        page++;
      } else {
        debug('no more contributors added to %s', name);
        break;
      }
    }

    // Filter out invalid contributors (undefined, etc).
    const contributors = listContributors
        .map(function({login, contributions, id}) {
          return {
            login,
            repository: name,
            contributions,
            id,
            full_name: full_name,
            html_url: html_url,
            description: description,
            stargazers_count: stargazers_count,
            watchers: watchers,
            archived: archived,
          };
        })
        .filter((item) => typeof item.login !== 'undefined')
        .filter((item) => !excludebots.includes(item.login));
    collection = collection.concat(contributors);
    return collection;
  }, []);

  const resolvedContributors = await contributors;
  debug('resolvedContributors:  %o', resolvedContributors.length);
  // Group Contributors inside an Organization
  const groupedContributors = resolvedContributors.reduce(
      (acc, currentValue) => {
      // if a contributor already exist and has contribute in other repositories
        if (acc[currentValue.login]) {
          const currentContributions = acc[currentValue.login].contributions;
          let currentRepositories = acc[currentValue.login].repositories;
          currentRepositories.push({
            name: currentValue.repository,
            contributions: currentValue.contributions,
            full_name: currentValue.full_name,
            html_url: currentValue.html_url,
            description: currentValue.description,
            watchers: currentValue.watchers,
            staergezers: currentValue.stargazers_count,
            archived: currentValue.archived,
          });
          currentRepositories = currentRepositories.sort((a, b) => {
            return b.contributions - a.contributions;
          });
          const newContributions =
          currentContributions + currentValue.contributions;
          acc[currentValue.login] = {
            id: currentValue.id,
            login: currentValue.login,
            contributions: newContributions,
            repositories: currentRepositories,
          };
        } else {
        // Add a new repo element
          acc[currentValue.login] = {
            id: currentValue.id,
            login: currentValue.login,
            contributions: currentValue.contributions,
            repositories: [
              {
                name: currentValue.repository,
                contributions: currentValue.contributions,
                full_name: currentValue.full_name,
                html_url: currentValue.html_url,
                description: currentValue.description,
                watchers: currentValue.watchers,
                staergezers: currentValue.stargazers_count,
                archived: currentValue.archived,
              },
            ],
          };
        }
        return acc;
      },
      {},
  );
  const itemsValues = Object.values(groupedContributors);
  const sortedValues = itemsValues.sort((a, b) => {
    return b.contributions - a.contributions;
  });
  return sortedValues;
};
