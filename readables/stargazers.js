const {
    loadQuery,
    appendQuery,
    buildBodyWithVariables,
    buildHeaders,
} = require('./graphql')

const {createStream} = require('./graphql-streams')

module.exports = (owner, name) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBodyWithVariables({owner, name}))
            .then(buildHeaders)
            .then(createStream())
}
