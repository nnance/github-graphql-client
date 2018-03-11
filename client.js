const { githubRequest, searchStarGazers } = require('./readables')
const { stdOut } = require('./writeables')

async function main(fileName) {
    // const input = await githubRequest(fileName)
    const input = await searchStarGazers()
    const output = stdOut()

    input.pipe(output)
}

const fileName = process.argv[process.argv.length - 1]
main(fileName)
