const {
    loadQuery,
    buildBody,
    buildHeaders,
    buildRequestOptions,
    createStream,
} = require('./graphql')

module.exports = () => {
    return loadQuery('./queries/searchReposByLang.gql')
            .then(buildBody)
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(createStream)
}
