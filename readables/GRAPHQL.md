# Using Node to call a GraphQL API

Making a call to a GraphQL API server can seem complicated at first glance.  There are a few good options like [Apollo Fetch](https://github.com/apollographql/apollo-fetch).  However, if you are building a Node application and want a simple solution that uses native node modules, here is your solution. At Credit Karma we were looking to use the GitHub GraphQL API to search for certain aspects of our repositories, so I developed a simple client and thought I would share what I discovered.

So before setting out to build the application, I established the following goals:

* It should work without any dependencies
* Should be able to load queries written as GraphQL Schema Language
* The queries should be able to use variables passed from the command line
* Support fragments being used in multiple queries
* Support pagination by calling the same query multiple times
* Built with pure functions
* Composable
* Streamable

In this example we are going to call the GitHub GraphQL API to get a list of Stargazers for a repository. The main query we will be sending:

```graphql
query StarGazers($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    stargazers(first: 100, after: $cursor) {
      ...starGazerFields
    }
  }
}
```

I am not going to cover the details of the GraphQL Language or how to build queries, however the following articles can provide some insight if you are new to GraphQL:

* [Introduction to GraphQL](http://graphql.org/learn/)
* [Queries and Mutations](http://graphql.org/learn/queries/)
* [Passing Arguments](http://graphql.org/graphql-js/passing-arguments/)
* [GraphQL Schema Language Cheat Sheet](https://wehavefaces.net/graphql-shorthand-notation-cheatsheet-17cd715861b6)

Let’s get started by breaking down the different functions I created in the library. Keeping in mind that one of the goals is to provide a library of pure functions to be composed together to easily make a request.

## loadQuery

One of our goals was to use GraphQL Schema Language files to compose our queries. An example of one of these files are illustrated above in the query example. We need to start by building a function that loads GraphQL files from disk

```js
const { readFile } = require('fs')
const { resolve } = require('path')

const loadQuery = (fileName) => new Promise((res, reject) => {
    readFile(resolve(fileName), 'utf-8', (err, data) => {
        (err) ? reject(err) : res(data)
    })
})
```

You will notice that I am wrapping the standard FileSystem readFile API in a promise. One of the advantages in doing this is to provide composability using the .then() notation. More about this later.

Now that we have a tool to load query files, you should checkout the use of a fragment in the query:

```graphql
...starGazerFields
```

But the fragment isn’t defined in the query file and as a result if we send this query to the server it will return an error. Below is an example of what this fragment might look like:

```graphql
fragment starGazerFields on StargazerConnection {
    pageInfo {
        endCursor
    }
    nodes {
        company
        bio
        name
        location
    }
}
```

## appendQuery

In order for the original query to work, we need to append the fragment above to the query before sending it to the server. I created the following function for this exact use case:

```js
const appendQuery = (fileName) => (query) =>
    loadQuery(fileName).then((results) => query + results)
```

This syntax might look a little strange but it is part of the composability I am trying to achieve. The appendQuery function takes a fileName and returns another function that accepts the original query and appends the file to it. I will provide an example of how these are composed together later in the article.

## buildBody

Now that we have the query loaded we need to build the body of the http POST we will be sending to GitHub. I created two different functions for this depending on wether you need to pass variables to the query:

```js
const buildBody = (query) => Promise.resolve({
    body: JSON.stringify({query})
})

const buildBodyWithVariables = (variables) => (query) => Promise.resolve({
    body: JSON.stringify({query, variables})
})
```

## buildHeaders

Once we have a stringified body we can build our header object needed to make the request.

```js
const buildHeaders = ({user, token}) => ({body}) => Promise.resolve({
    body,
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'User-Agent': `${user}`,
        'Authorization': `token ${token}`
    }
})
```

**Observations**: You may have noticed that in this function as well as the previous two I am using Promise.resolve to return a result of the promise immediately. I am continuing to use promises to keep the composability consistent with the query loader.

## buildRequestOptions

Now that we have the payload of the request constructed, we can define the details of the end point we want to call.

```js
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
```

**Observations**: I have used object destruction for the function parameters. This is a great way to identify the structure of the object required to call this function.

## makeRequest

Let’s send the request to the GraphQL API server. I am batching up the results from the server into a single JSON object result.

```js
const { request } = require('https')

const makeRequest = ({options, body}) => new Promise((resolve, reject) => {
    request(options, (res) => {
        let result = ''
        res.on('data', (chunk) => result += chunk)
        res.on('end', () => resolve(JSON.parse(result)))
        res.on('error', (err) => reject(err))
    }).write(body)
})
```

**Observations**: Again I am wrapping the details of the standard request method of Node in a promise to make it more composable when used with a stream.

## Trying it all out

So how do we use all these functions to make a GraphQL request?

```js
loadQuery('./starGazerFragment.gql')
    .then(appendQuery('./searchStarGazers.gql'))
    .then(buildBodyWithVariables({owner: 'hapijs', name: 'hapi'}))
    .then(buildHeaders({user: '...', token: '...'}))
    .then(buildRequestOptions)
    .then(makeRequest)
    .then((results) => console.dir(results, {depth: null}))
```

This may look pretty complicated and have several moving parts however, it provides the flexibility of any step of the process to be easily replaced making it highly customizable.

## Making it streamable

This is easily accomplished using the streaming Node native library. Below I have turned the previous example into a function and I am using it in a readable stream.

```js
const { Readable } = require('stream')

const sendRequest = () => loadQuery('./starGazerFragment.gql')
    .then(appendQuery('./searchStarGazers.gql'))
    .then(buildBodyWithVariables({owner: 'hapijs', name: 'hapi'}))
    .then(buildHeaders({user: '...', token: '...'}))
    .then(buildRequestOptions)
    .then(makeRequest)

const createStream = () => new Readable({
    objectMode: true,
    read(opts) {
        if (!this.requestCompleted) {
            return sendRequest().then((data) => {
                this.requestCompleted = true
                this.push(data)
            })
        } else {
            this.push(null)
        }
    }
})
```

## Closing Thoughts

Though there are many different libraries that can be used to make a GraphQL request, I found something satisfying in building a simple 60 line module without an external dependencies. I have used this little library to execute several different GitHub GraphQL queries with success. The composable nature of the API results in some boilerplate but the flexibility of API seems to provide a good balance.

Let me know your thoughts in the comments below, or connect with me directly on Twitter @nancenick.
