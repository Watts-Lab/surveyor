# Surveyor
Surveyor generates data driven surveys for online participants. It imports survey questions and data from sources such as Google Drive sheets, CSV or JSON. It can serve them via URL or as an API hit for Amazon Mechanical Turk. Results are available as CSV or JSON at a secure endpoint.

## Development
Create an `.env` file in the root directory and add:
For local mongo development
```PowerShell
PORT=4000
PROD=False
MONGO=True
TEST_URI=mongodb://localhost:27017/
TEST_DB=testDB
PROD_URI=nothing
PROD_DB=nothing
```

For local nedb development
```PowerShell
PORT=4000
PROD=False
MONGO=False
TEST_URI=nothing
TEST_DB=nothing
PROD_URI=nothing
PROD_DB=nothing
```

Run `npm install` to install all dependencies. Run `npm test` to launch continuous Typescript compilation, watching for changes in any of the `ts` files. Leave this shell alone and, in a new one, run `npm start` to launch the application on the port in `.env`. With this setting it would start a server at [`localhost:4000`](http://localhost:4000).

When developing work with `npm test` running in the background and edit the `.ts` files. Each time one is saved Typescript will attempt to compile to `.js` files and will report any issues in the shell.

It will generate several local folders that are ignored by GitHub, including `.data` which is a development data store.