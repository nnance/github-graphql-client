const {
    loadQuery,
    appendQuery,
    buildBodyWithVariables,
    buildHeaders,
    buildRequestOptions,
    makeRequest,
} = require('./graphql')

const {Readable} = require('stream')

const sendRequest = (owner, name, cursor) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBodyWithVariables({owner, name, cursor}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(makeRequest)
}

module.exports = (owner, name) => {
    const streamer = new Readable({
        objectMode: true,
        read(size) {
            const pushResults = (results) => {
                this.cursor = results.data.repository.stargazers.pageInfo.endCursor
                this.requestCount++
                this.push(results)
            }
            if (this.requestCount == 0) {
                return sendRequest(owner, name).then((results) => pushResults(results))
            } else if (this.cursor) {
                return sendRequest(owner, name, this.cursor).then((results) => pushResults(results))
            } else {
                this.push(null)
            }
        }
    })
    streamer.requestCount = 0
    return Promise.resolve(streamer)
}
