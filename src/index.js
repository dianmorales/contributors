const {Octokit} = require('@octokit/rest');
const ORGANIZATION_DEFAULT = 'verdaccio';
const LIMIT_PAGE = 500;

async function getRepositories(octokit, organization) {  
  const {data} = await octokit.repos.listForOrg({org: organization});

  return data;
}

exports.getRepositories = getRepositories;

module.exports = async function(token, organization = ORGANIZATION_DEFAULT) {
  const octokit = new Octokit({auth: token});  
  const repositories = await getRepositories(octokit, organization);  

  const contributors = repositories.reduce(async (acc, currentValue) => {
    let collection = await acc;  
    const {name, owner: { login }} = currentValue;
    const contributorsData = await octokit.repos.listContributors({owner: login, repo: name, anon: true, per_page: LIMIT_PAGE});
    const filterLogin = '';
    const contributors = contributorsData.data.map(({login, contributions, id}) => ({login, contributions, id}),
    ).filter((item) => typeof item.login !== 'undefined');    
    collection = collection.concat(contributors);
    return collection;
  }, []);
  const resolvedContributors = await contributors;
  const groupedContributors = resolvedContributors.reduce((acc, currentValue) => {    
    if (acc[currentValue.login]) {
       const currentContributions = acc[currentValue.login].contributions;
      const newContributions = currentContributions + currentValue.contributions;
      acc[currentValue.login] = {id: currentValue.id, login: currentValue.login, contributions: newContributions};
    } else {
        acc[currentValue.login] = {id: currentValue.id, login: currentValue.login, contributions: currentValue.contributions};
      }
      return acc;
  }, {});

 const itemsValues = Object.values(groupedContributors);
 const sortedValues = itemsValues.sort((a, b) => { 
     return b.contributions - a.contributions;
 });
    return sortedValues;
};
