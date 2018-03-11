const {Readable} = require('stream')
const {
    buildBody,
    buildHeaders,
    buildRequestOptions,
    loadQuery,
    appendQuery,
    makeRequest,
 } = require('./graphql')

const initialRequest = (options) => () => {
    return makeRequest(options).then((data) => ({
        data,
        nextStep: requestCompleted(options)
    }))
}

const requestCompleted = (options) => () => Promise.resolve({
    data: null,
    nextStep: null
})

const createStream = (options) => {
    return buildRequestOptions(options)
            .then((options) => {
                const result = new Readable({
                    objectMode: true,
                    read(opts) {
                        this.nextStep().then(({data, nextStep}) => {
                            this.nextStep = nextStep
                            this.push(data)
                        })
                    }
                })
                result.nextStep = initialRequest(options)
                return result
            })
}

const githubRequest = (fileName) => {
    return loadQuery(fileName)
            .then(buildBody({}))
            .then(buildHeaders)
            .then(createStream)
}

module.exports = {
    githubRequest,
    createStream
}
