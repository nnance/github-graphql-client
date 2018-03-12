const { request } = require('https')
const { readFile } = require('fs')
const { resolve } = require('path')
const { Readable } = require('stream')

const buildRequestOptions = ({headers, body}) => Promise.resolve({
    body,
    options: {
        method: 'POST',
        host: 'api.github.com',
        path: '/graphql',
        port: 443,
        headers
    }
})

const buildHeaders = ({body}) => Promise.resolve({
    body,
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'User-Agent': `${process.env.USER}`,
        'Authorization': `token ${process.env.TOKEN}`
    }
})

const buildBody = (query) => Promise.resolve({
    body: JSON.stringify({query})
})

const buildBodyWithVariables = (variables) => (query) => Promise.resolve({
    body: JSON.stringify({query, variables})
})

const loadQuery = (fileName) => new Promise((res, reject) => {
    readFile(resolve(fileName), 'utf-8', (err, data) => {
        (err) ? reject(err) : res(data)
    })
})

const appendQuery = (fileName) => (query) => {
    return loadQuery(fileName).then((results) => query + results)
}

const makeRequest = ({options, body}) => new Promise((resolve, reject) => {
    request(options, (res) => {
        let result = ''
        res.on('data', (chunk) => result += chunk)
        res.on('end', () => resolve(JSON.parse(result)))
        res.on('error', (err) => reject(err))
    }).write(body)
})

const createStream = (options) => new Readable({
    objectMode: true,
    read(opts) {
        if (!this.requestCompleted) {
            return makeRequest(options).then((data) => {
                this.requestCompleted = true
                this.push(data)
            })
        } else {
            this.push(null)
        }
    }
})

module.exports = {
    buildBody,
    buildBodyWithVariables,
    buildHeaders,
    buildRequestOptions,
    loadQuery,
    appendQuery,
    makeRequest,
    createStream,
}
