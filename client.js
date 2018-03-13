const readables = require('./readables')
const { stdOut } = require('./writeables')
const { locationFilter } = require('./transforms/filter')
const { csvTransform } = require('./transforms/csv')
const { createWriteStream, existsSync, unlinkSync } = require('fs')

async function main(fileName) {
    // const input = await githubRequest(fileName)
    // const input = await searchStarGazers(process.argv[3], process.argv[4])
    if (readables[fileName]) {
        const input = await readables[fileName](process.env.USER, process.env.TOKEN, process.argv[3], process.argv[4])
        const outputName = `./${fileName}.csv`
        if (existsSync(outputName)) {
            unlinkSync(outputName)
        }
        const output = createWriteStream(outputName, {encoding: 'utf8', autoClose: true})
        // const output = stdOut()
        input.pipe(locationFilter).pipe(csvTransform).pipe(output)
    } else {
        console.error('Invalid argument')
    }
}

const fileName = process.argv[2]
main(fileName)
