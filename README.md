# github-graphql-client

Simple GitHub GraphQL Client setup as an ETL pipeline to extract data from GitHub and load it into CSV files.  This project resulted in a generic GraphQL library for Node with zero dependencies.  You can find more about this library [here](./readables/GRAPHQL.md)

## Getting started

This project is built completely on native Node modules therefore, doesn't require any installation step.  It does depend on Node 8 or greater.

## Project setup

This project uses Node streams as an ETL pipeline and as such is setup with a library of readable, transforms and writable streams.

* /readables - contains the GitHub client library to make GraphQL requests
* /transform - library of filters and transforms
* /writables - library to write to std out and any other output not supported by node

The entry point for the application is `client.js` that process the command line parameters.

## Using the project

The following is a couple of examples of how to use the project.  The project requires a personal access token from GitHub which can be created at github.com/settings/tokens

### Loading stargazers

The following command will load all the stargazers from a given owner and repo into a csv file named `stargazers.csv`

```sh
USER=... TOKEN=... node client.js stargazers hapijs hapi
```

### Searching repos

Find all repos for a specific language and output to standard out

```sh
USER=... TOKEN=... node client.js searchReposByLang
```
