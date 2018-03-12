const readables = require('./readables')
const { searchStarGazers } = require('./stargazers')
const { stdOut } = require('./writeables')

async function main(fileName) {
    // const input = await githubRequest(fileName)
    // const input = await searchStarGazers(process.argv[3], process.argv[4])
    if (readables[fileName]) {
        const input = await readables[fileName](process.argv[3], process.argv[4])
        const output = stdOut()

        input.pipe(output)
    } else {
        console.error('Invalid argument')
    }
}

const fileName = process.argv[2]
main(fileName)
