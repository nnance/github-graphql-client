const request = require('request');

const options = {
    method: 'POST',
    uri: 'https://api.github.com/graphql',
    json: true,
    headers: {
        'User-Agent': 'nick-nance-ck',
        'Authorization': 'token 05fac20af1bddd12055308ab9e7d881eebd13cbc'
    },
    body: {
        query: `{
            search(query: "org:ck-private language:Scala", type: REPOSITORY, first: 10) {
                repositoryCount
                edges {
                  node {
                    ... on Repository {
                      name
                      descriptionHTML
                      updatedAt
                    }
                  }
                }
            }
        }`
    }
}

request(options, (err, res) => {
  if (err) { return console.error(err); }
  console.dir(res.body, { depth: null });
})
