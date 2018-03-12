const {Readable} = require('stream')
const {makeRequest} = require('./graphql')

const createStream = (options) => new Readable({
    objectMode: true,
    read(opts) {
        if (!this.requestCompleted) {
            return makeRequest(options).then((data) => {
                this.requestCompleted = true
                this.push(data)
            })
        } else {
            this.push(null)
        }
    }
})

module.exports = {
    createStream,
}
