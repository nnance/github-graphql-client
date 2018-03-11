const { request } = require('https')
const { readFile } = require('fs')
const path = require('path')
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

const buildBody = (variables) => (query) => Promise.resolve({
    body: JSON.stringify({query, variables})
})

const loadQuery = (fileName) => new Promise((resolve, reject) => {
    readFile(path.resolve(`./queries/${fileName}.gql`), 'utf-8', (err, data) => {
        (err) ? reject(err) : resolve(data)
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


const initialRequest = (options) => () => {
    return makeRequest(options).then((data) => ({
        data,
        nextStep: requestCompleted(options)
    }))
}

const requestCompleted = (options) => () => Promise.resolve({
    data: null,
    nextStep: null
})

const createStream = (options) => {
    const result = new Readable({
        objectMode: true,
        read(opts) {
            this.nextStep().then(({data, nextStep}) => {
                this.nextStep = nextStep
                this.push(data)
            })
        }
    })
    result.nextStep = initialRequest(options)
    return result
}

const githubRequest = (fileName) => {
    return loadQuery(fileName)
            .then(buildBody({owner: 'hapijs', name: 'hapi'}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(createStream)
}

const searchStarGazers = () => {
    return loadQuery('starGazerFragment')
            .then(appendQuery('searchStarGazers'))
            .then(buildBody({owner: 'hapijs', name: 'hapi'}))
            .then(buildHeaders)
            .then(buildRequestOptions)
            .then(createStream)
}

module.exports = {
    githubRequest,
    searchStarGazers
}
