const request = require('request')
const { readFile } = require('fs')
const path = require('path')

const buildRequestOptions = (gqlQuery) => {
    return Promise.resolve({
        method: 'POST',
        uri: 'https://api.github.com/graphql',
        json: true,
        headers: {
            'User-Agent': 'nick-nance-ck',
            'Authorization': `token ${process.env.TOKEN}`
        },
        body: { query: gqlQuery }
    })
}

const loadQuery = (fileName) => {
    const fullPath = path.resolve(`./queries/${fileName}.gql`)
    return new Promise((resolve, reject) => {
        readFile(fullPath, 'utf-8', (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

const makeRequest = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.body)
            }
        })
    })
}

const outputToConsole = (results) => {
    console.dir(results, { depth: null })
}

const fileName = process.argv[process.argv.length - 1]
loadQuery(fileName)
    .then(buildRequestOptions)
    .then(makeRequest)
    .then(outputToConsole)

