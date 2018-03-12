const { Transform } = require("stream")

const caliFilter = (user) =>
    user.location &&
    user.name &&
    user.name.length > 0 &&
    user.location.toUpperCase().indexOf('CA') > -1 &&
    user.location.toUpperCase().indexOf('CANADA') == -1

const locationFilter = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        const cali = chunk.data.repository.stargazers.nodes.filter(caliFilter)
        chunk.data.repository.stargazers.nodes = cali
        this.push(chunk)
        callback()
    }
})

module.exports = {
    locationFilter
}
