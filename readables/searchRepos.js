const {
    loadQuery,
    buildBody,
    buildHeaders,
    buildRequestOptions,
} = require('./graphql')

const {createStream} = require('./graphql-streams')

module.exports = () => {
    return loadQuery('./queries/searchReposByLang.gql')
            .then(buildBody)
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(createStream)
}
