const {
    loadQuery,
    buildBody,
    buildHeaders,
    buildRequestOptions,
    createStream,
} = require('./graphql')

module.exports = ({user, token}) => {
    return loadQuery('./queries/searchReposByLang.gql')
            .then(buildBody)
            .then(buildHeaders({user, token}))
            .then(buildRequestOptions)
            .then(createStream)
}
