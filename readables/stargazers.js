const {
    loadQuery,
    appendQuery,
    buildBodyWithVariables,
    buildHeaders,
    buildRequestOptions,
    makeRequest,
} = require('./graphql')

const {Readable} = require('stream')

const createRequest = ({user, token, owner, name}) => (cursor) => {
    const path = './queries'
    return loadQuery(`${path}/starGazerFragment.gql`)
            .then(appendQuery(`${path}/searchStarGazers.gql`))
            .then(buildBodyWithVariables({owner, name, cursor}))
            .then(buildHeaders({user, token}))
            .then(buildRequestOptions)
            .then(makeRequest)
}

module.exports = (user, token, owner, name) => {
    const sendRequest = createRequest({user, token, owner, name})

    const streamer = new Readable({
        objectMode: true,
        read(size) {
            const pushResults = (results) => {
                this.cursor = results.data.repository.stargazers.pageInfo.endCursor
                this.requestCount++
                this.push(results)
            }
            if (this.requestCount == 0) {
                return sendRequest().then((results) => pushResults(results))
            } else if (this.cursor) {
                return sendRequest(this.cursor).then((results) => pushResults(results))
            } else {
                this.push(null)
            }
        }
    })
    streamer.requestCount = 0
    return Promise.resolve(streamer)
}
