const {Readable} = require('stream')
const {
    buildRequestOptions,
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

const StagedStreamer = (initialRequest) => {
    const result = new Readable({
        objectMode: true,
        read(opts) {
            this.nextStep().then(({data, nextStep}) => {
                this.nextStep = nextStep
                this.push(data)
            })
        }
    })
    result.nextStep = initialRequest
    return result
}

const createStream = (initReq) => (options) => {
    return buildRequestOptions(options)
            .then((options) => StagedStreamer(initReq || initialRequest(options)))
}

module.exports = {
    createStream
}
