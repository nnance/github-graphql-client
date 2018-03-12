const {
    loadQuery,
    appendQuery,
    buildBodyWithVariables,
    buildHeaders,
    buildRequestOptions,
    makeRequest,
} = require('./graphql')

const {Readable} = require('stream')

const cursorStream = (options) => {
    const streamer = new Readable({
        objectMode: true,
        read(opts) {
            return makeRequest(options).then((data) => {
                if (this.requestCount < 2) {
                    this.requestCount++
                    this.push(data)
                } else {
                    this.push(null)
                }
            })
        }
    })
    streamer.requestCount = 0
    return streamer
}

module.exports = (owner, name) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBodyWithVariables({owner, name}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(cursorStream)
}
