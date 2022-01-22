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


## Survey Specifications
The surveys that we use have the following columns. Additional support for other optional columns will be added in the future: 

| Column Name | Required | Description |
| :- | :- | :- |
| `name` | Yes | A name assigned to the question (must be unique within a survey) |
| `prompt` | Yes | Each unique prompt or question |
| `response` | Yes | The type of response required. Values of `text`, `number` or `date`, will constrain the response to one of those formats. Values that have a string separated by `\|` or `&` (with spaces around them) will be converted to radio buttons (single select forced choice) or checkboxes (multi select) respectively. |
| `coding` |  | If the values are reverse coded (has`reverse` if true and is left blank otherwise) |
| `answer` |  | The correct answer for the question (if one exists) |
| `image` |  | The image link for an image (left blank if there isn't one) |
| `page` |  | The page the question should appear on, ordered alphanumerically (if the column is included it cannot be left blank) |
| `group_prompt` |  | The overall prompt/direction for the survey taker, will appear in the survey wherever it changes to indicate a new group of questions or kind of response needed |

An example assignment of columns is given below (taken from the REI survey):

| `name` | `prompt`| `response` | `group_prompt` | `coding` |
| :- | :- | :- | :- | :- |
|thinking_in_depth | I try to avoid situations that require thinking in depth about something. | Completely false \| Mostly false \| Neither true nor false \| Mostly true \| Completely True | Please rate how true the following statement is of you. |reverse |


See examples of surveys in the [`/surveys`](https://github.com/Watts-Lab/surveyor/tree/main/surveys) folder.
