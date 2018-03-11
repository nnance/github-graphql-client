const {
    loadQuery,
    appendQuery,
    buildBody,
    buildHeaders,
    buildRequestOptions,
    createStream,
} = require('./readables')

const searchStarGazers = (owner, name) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBody({owner, name}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(createStream)
}

module.exports = {
    searchStarGazers
}
