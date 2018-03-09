const request = require('request')
const fs = require('fs')
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
        fs.readFile(fullPath, 'utf-8', (err, data) => {
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

loadQuery('searchReposByLang')
    .then(buildRequestOptions)
    .then(makeRequest)
    .then(outputToConsole)
