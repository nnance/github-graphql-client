const {
    loadQuery,
    appendQuery,
    buildBodyWithVariables,
    buildHeaders,
    buildRequestOptions,
    makeRequest,
} = require('./graphql')

const {Readable} = require('stream')

module.exports = (owner, name) => {
    const streamer = new Readable({
        objectMode: true,
        read(size) {
            return sendRequest(owner, name, this.cursor).then((data) => {
                if (this.cursor != null && this.requestCount < 3) {
                    this.cursor = data.data.repository.stargazers.pageInfo.endCursor || null
                    this.push(data)
                } else {
                    this.push(null)
                }
            })
        }
    })
    streamer.cursor = 1
    streamer.requestCount = 0
    return Promise.resolve(streamer)
}

const sendRequest = (owner, name, cursor) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBodyWithVariables({owner, name}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(makeRequest)
}
