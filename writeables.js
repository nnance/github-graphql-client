const { Writable } = require('stream')

const stdOut = () => new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        console.dir(chunk, { depth: null })
        callback()
    }
})

module.exports = {
    stdOut
}
