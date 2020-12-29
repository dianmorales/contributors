const {Octokit} = require('@octokit/rest');
const ORGANIZATION_DEFAULT = 'verdaccio';

module.exports = async function(token, organization = ORGANIZATION_DEFAULT) {
  const octokit = new Octokit({auth: token});
  const {data} = await octokit.repos.listForOrg({org: organization});
  const contributors = data.reduce(async (acc, currentValue) => {
    let collection = await acc;
    const {name, owner} = currentValue;
    const contributorsData = await octokit.repos.listContributors({owner: owner.login, repo: name, anon: true, per_page: 500});
    const contributors = contributorsData.data.map((contributor) => contributor.login,
    ).filter((item) => typeof item !== 'undefined');
    collection = collection.concat(contributors);
    return collection;
  }, []);

  return [...new Set(await contributors)];
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
