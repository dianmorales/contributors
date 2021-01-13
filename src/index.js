const {Octokit} = require('@octokit/rest');
const ORGANIZATION_DEFAULT = 'verdaccio'; 
const LIMIT_PAGE = 500;

// eslint-disable-next-line require-jsdoc
async function getRepositories(octokit, organization) {
  const {data} = await octokit.repos.listForOrg({org: organization});

  return data;
}

exports.getRepositories = getRepositories;

module.exports = async function(token, organization = ORGANIZATION_DEFAULT) {
  const octokit = new Octokit({auth: token});

  // Repositories for an Organization
  const repositories = await getRepositories(octokit, organization);

  const contributors = repositories.reduce(async (acc, currentValue) => {
    let collection = await acc;
    const {name, owner: {login}} = currentValue;

    // Contributors by a specific repository 
    const contributorsData = await octokit.repos.listContributors({owner: login, repo: name, anon: true, per_page: LIMIT_PAGE});
    // Filter out invalid contributors (undefined, etc).
    const contributors = contributorsData.data.map(function({login, contributions, id}) {
      return {
        login,
        repository: name,
        contributions,
        id,
      };
    }).filter((item) => typeof item.login !== 'undefined');
    collection = collection.concat(contributors);
    return collection;
  }, []);


  const resolvedContributors = await contributors;
  // Group Contributors inside an Organization
  const groupedContributors = resolvedContributors.reduce((acc, currentValue) => {
    // if a contributor already exist and has contribute in other repositories
    if (acc[currentValue.login]) {
      const currentContributions = acc[currentValue.login].contributions;
      const currentRepositories = acc[currentValue.login].repositories;
      currentRepositories.push({
        name: currentValue.repository,
        contributions: currentValue.contributions,
      });
      const newContributions = currentContributions + currentValue.contributions;
      acc[currentValue.login] = {id: currentValue.id, login: currentValue.login, contributions: newContributions, repositories: currentRepositories};
    } else {
      // Add a new repo element
      acc[currentValue.login] = {id: currentValue.id, login: currentValue.login, contributions: currentValue.contributions, repositories: [
        {
          name: currentValue.repository,
          contributions: currentValue.contributions,
        },
      ]};
    }
    return acc;
  }, {});
  const itemsValues = Object.values(groupedContributors);
  const sortedValues = itemsValues.sort((a, b) => {
    return b.contributions - a.contributions;
  });
  return sortedValues;
};
