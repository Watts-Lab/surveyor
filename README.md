# Surveyor
Surveyor generates data driven surveys for online participants. It imports survey questions and data from sources such as Google Drive sheets, CSV or JSON. It can serve them via URL or as an API hit for Amazon Mechanical Turk. Results are available as CSV or JSON at a secure endpoint.

## Development
Create an `.env` file in the root directory and add:
Do not use any of the following config variables with KEY in production.
```PowerShell
PORT=4000
PROD=FALSE
URI=mongodb://localhost:27017
TEST_DB=testDB
PROD_DB=prodDB
RANDOM=TESTISRANDOM
TOKEN_KEY=TESTISRANDOM
SECRET_KEY=TESTISRANDOM
ENCRYPT_KEY=TESTISRANDOM
IV_KEY=a0f5c2b327abb291c7cecdea1b2f8cc5 
DOMAIN=http://localhost:4000/
```

Run `npm install` to install all dependencies. Run `npm test` to launch continuous Typescript compilation, watching for changes in any of the `ts` files. Leave this shell alone and, in a new one, run `npm start` to launch the application on the port in `.env`. With this setting it would start a server at [`localhost:4000`](http://localhost:4000).

When developing work with `npm test` running in the background and edit the `.ts` files. Each time one is saved Typescript will attempt to compile to `.js` files and will report any issues in the shell.

It will generate several local folders that are ignored by GitHub, including `.data` which is a development data store.

## Contributors
For the a pull request to be approved, the code must pass any automated code checks, be formatted with prettier, and have no eslint errors. We highly recommend contributors to install eslint and prettier. 

### Installing and Running Eslint and Prettier for local development
Running `npm install` should install dev dependencies.

To run eslint to see errors, `npm run lint` and to fix fixable errors, please run `npm run lint-and-fix`. Eslint will lint code for common errors.

After linting and before submitting a pull request, you should format your code wih pretttier. This can be done with the command `npm run format`.