const request = require('request')
const { readFile } = require('fs')
const path = require('path')
const { Readable } = require('stream')

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

const githubRequest = (fileName) => {
    const createStream = (options) => new Readable({
        objectMode: true,
        complete: false,
        read(opts) {
            if (this.complete) {
                this.push(null)
            } else {
                makeRequest(options).then(function (data) {
                    this.complete = true
                    this.push(data)
                }.bind(this))
            }
        }
    })
    return loadQuery(fileName)
            .then(buildRequestOptions)
            .then(createStream)
}

module.exports = {
    githubRequest
}
