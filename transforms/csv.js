const { Transform } = require("stream")

const csvTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        const cali = chunk.data.repository.stargazers.nodes.reduce((prev, user) => {
            return prev + `"${user.name}","${user.company}","${user.location}"\r\n`
        }, '')
        this.push(cali)
        callback()
    }
})

module.exports = {
    csvTransform
}
