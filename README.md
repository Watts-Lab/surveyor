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
The surveys that we use have the following required columns: 

| `name` | `prompt`| `response` |
| :- | :- | :- |
| A name assigned to the question (must be unique within a survey) | Each unique prompt or question | The type of response required, can be free entry (indicated by entry eg: text, number, etc.) or exact options (checkboxes are a string separated by `\|` and radiobuttons are separated by `&` |

There are also several optional columns which are given below (we will add support for more in the future):
| `reverse` | `answer`| `image` |  `page` |  `group_prompt` |
| :- | :- | :- | :- | :- |
| If the values are reverse coded (is left blank if not true and has`reverse` if true) | The correct answer for the question (if one exists) | The image link for an image (left blank if there isn't one) | The page the question should appear on, ordered alphanumerically (if the column is included it cannot be left blank) | The overall prompt/direction for the survey taker, will appear in the survey wherever it changes to indicate a new group of questions or kind of response needed |

An example assignment of columns is given below (taken from the REI survey):

| `name` | `prompt`| `response` | `group_prompt` | `coding` |
| :- | :- | :- | :- | :- |
|thinking_in_depth | I try to avoid situations that require thinking in depth about something. | Completely false \| Mostly false \| Neither true nor false \| Mostly true \| Completely True | Please rate how true the following statement is of you. |reverse |


Current Survey Folder: https://github.com/Watts-Lab/surveyor/tree/main/surveys
