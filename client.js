const readables = require('./readables')
const { stdOut } = require('./writeables')
const { locationFilter } = require('./transforms/filter')
const { csvTransform } = require('./transforms/csv')
const { createWriteStream, existsSync, unlinkSync } = require('fs')

const searchStarGazers = async (user, token) => {
    const input = await readables.stargazers(user, token, process.argv[3], process.argv[4])
    const outputName = './stargazers.csv'
    if (existsSync(outputName)) {
        unlinkSync(outputName)
    }
    const output = createWriteStream(outputName, {encoding: 'utf8', autoClose: true})
    input.pipe(locationFilter).pipe(csvTransform).pipe(output)
}

const searchReposByLang = async (user, token) => {
    const input = await readables.searchRepos(user, token)
    input.pipe(stdOut())
}

const commands = {
    searchStarGazers,
    searchReposByLang
}

async function main(fileName) {
    commands[fileName] ? commands[fileName](process.env.USER, process.env.TOKEN) : console.error('Invalid command')
}

const fileName = process.argv[2]
main(fileName)
