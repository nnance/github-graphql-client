const {
    loadQuery,
    buildBody,
    buildHeaders,
} = require('./graphql')

const {createStream} = require('./graphql-streams')

module.exports = () => {
    return loadQuery('./queries/searchReposByLang.gql')
            .then(buildBody)
            .then(buildHeaders)
            .then(createStream())
}
