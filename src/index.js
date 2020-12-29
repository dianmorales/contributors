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
    const contributors = contributorsData.data.map(({login, contributions}) => ({login, contributions}),
    ).filter((item) => typeof item.login !== 'undefined');    
    collection = collection.concat(contributors);
    return collection;
  }, []);
  const resolvedContributors = await contributors;
  const response = new Map();
  const groupedContributors = resolvedContributors.reduce((acc, currentValue) => {    
      if (acc.has(currentValue.login)) {
        const currentContributions = acc.get(currentValue.login).contributions;
        const newContributions = currentContributions + currentValue.contributions;
        acc.set(currentValue.login, {login: currentValue.login, contributions: newContributions});
      } else {
        acc.set(currentValue.login, {contributions: currentValue.contributions });
      }
      return acc;
  }, new Map());

  return groupedContributors;
};


// octokit.repos.listContributors({owner: 'juanpicado', repo: 'verdaccio', anon:true, per_page:100}).then((response) => {
// console.log('response', response);

// });

// const response = await octokit.repos.listForOrg({org: ORGANIZATION});

// 2.
// octokit.repos.listContributors({owner: 'juanpicado', repo: 'verdaccio', anon:true, per_page:70}).then((response) => {
//    console.log('response', response);
// });


// List of Returns the total number of commits authored by the contributor. In addition, the response includes a Weekly Hash

// https://api.github.com/repos/juanpicado/verdaccio/stats/contributors
// octokit.repos.getContributorsStats({owner: 'juanpicado', repo: 'verdaccio'}).then((response) => {
//    console.log('contributors ', typeof response);
// });

/* REPO : verdaccio, ui, monorepo
CONTRIBUTORS v:  

 
*/


// octokit.repos.listForUser({
//  username,
// })then((response) => {
// console.log('contributors ', response);
// });

/*
1. LISTAR REPOSITORIOS DE LA ORGANIZACION  = 44 :  https://api.github.com/orgs/verdaccio/repos
2. LISTAR CONTRIBUTORS DE CADA REPOSITORIO : https://octokit.github.io/rest.js/v18#repos-list-contributors : https://api.github.com/repos/juanpicado/verdaccio/contributors?anon=true&per_page=70
3. merge de todos los contributors (distinct)
 4. imprimir lista de contributors


*/
// - repo 1: ['juanpicado', 'dsa', 'dsadsa']
// - repo 2: ['juanpicado', 'vvvv', 'ffffff']

//

// fase 2

// 5. listar contributors por fecha de contribution. (el primero de la lista es el ultimo que ha contribuidor)
