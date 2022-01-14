/** @format */
// import fs from "fs";
// import { createInterface } from "readline"; //Used for setting token
// import { google } from "googleapis"; //Used for accessing google drive
import parse = require("csv-parse")
import stringify = require("csv-stringify")
import request = require("request")

// Logs into Google Account
// function authorize() {
//   return new Promise((resolve, reject) => {
//     const oAuth2Client = new google.auth.OAuth2(
//       process.env.G_ID,
//       process.env.G_SECRET,
//       "urn:ietf:wg:oauth:2.0:oob"
//     );
//     if (!process.env.access_token) {
//       return getAccessToken(oAuth2Client);
//     } else {
//       oAuth2Client.setCredentials({
//         access_token: process.env.access_token,
//         refresh_token: process.env.refresh_token,
//         token_type: process.env.token_type,
//         expiry_date: process.env.expiry_date,
//       });
//       resolve(oAuth2Client);
//     }
//   });
// }

// Creates access token for oAuth 2
// function getAccessToken(oAuth2Client) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://www.googleapis.com/auth/drive.readonly"],
//   });
//   console.log("\nAuthorize by visiting this url:\n\n", authUrl, "\n");
//   const rl = createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("The enter code: ", (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error("Error retrieving access token", err);
//       oAuth2Client.setCredentials(token);
//       console.log("Store token values in .env:");
//       console.log(JSON.stringify(token));
//     });
//   });
// }

// Returns JSON of CSV string
export const parseCSV = (csvData: string): Promise<Object[]> => {
  return new Promise((resolve, reject) => {
    parse(csvData, { columns: true }, (err, JSONData) => {
      if (err) reject(err)
      resolve(JSONData)
    })
  })
}

// Returns JSON of CSV string
export const parseJSON = (JSONData, callback = console.log) => {
  stringify(JSONData, { header: true, quoted_string: true }, (err, csvData) => {
    if (err) console.log(err)
    callback(csvData)
  })
}

// Merges two arrays of objects via a single shared key
export function merge(Obj1, Obj2, key) {
  return Obj1.map((u) => {
    try {
      const v = Obj2.filter((v) => v[key] === u[key])[0]
      Object.keys(v).forEach((k) => (u[k] = v[k]))
      return u
    } catch (e) {
      return false
    }
  }).filter((u) => u)
}

// function getDataSheet(auth, location) {
//   return new Promise((resolve, reject) => {
//     const drive = google.drive({ version: "v3", auth });
//     drive.files.export(
//       { fileId: location, mimeType: "text/csv" },
//       (err, response) => {
//         // console.log(response);
//         if (err) reject(err, err.stack);
//         // console.log(response.data);
//         resolve(response.data);
//       }
//     );
//   });
// }

// function getSheetsData(auth, location) {
//   return new Promise((resolve, reject) => {
//     const client = google.sheets({ version: "v4", auth: auth });
//     client.spreadsheets.get(
//       {
//         spreadsheetId: location,
//         fields: "*",
//       },
//       (err, response) => {
//         if (err) reject(err, err.stack);
//         resolve(response.data);
//       }
//     );
//   });
// }

export function getRequestSheetCSV(url, title) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: url,
        headers: { Authorization: `Bearer ${process.env.access_token}` },
      },
      (err, response, body) => {
        if (err) reject(err)
        resolve({ title: title, data: body })
      }
    )
  })
}

export function getSheetsContent(sheetsData) {
  return Promise.all(
    sheetsData.sheets.map((s) => {
      return getRequestSheetCSV(
        `https://docs.google.com/spreadsheets/d/${sheetsData.spreadsheetId}/export?format=csv&id=${sheetsData.spreadsheetId}&gid=${s.properties.sheetId}`,
        s.properties.title
      )
    })
  )
}

export function parseCSVs(csvDataList) {
  return Promise.all(csvDataList.map((sheet) => parseCSV(sheet.data)))
}

//Logs if thre's an issue
export function logError(error) {
  console.log(`Logging error: ${error}`)
  console.log(error.stack)
}

// function loadData() {
//   return authorize()
//     .then(getDataSheet)
//     .then(parseCSV)
//     .then(console.log("Imported data"))
//     .catch(logError);
// }

// function loadCSV(location) {
//   return authorize()
//     .then((a) => getDataSheet(a, location))
//     .then(parseCSV)
//     .then(console.log("Imported data"))
//     .catch(logError);
// }

// function loadAllSheetsCSV(location) {
//   return authorize()
//     .then((a) => getSheetsData(a, location))
//     .then(getSheetsContent)
//     .then(parseCSVs)
//     .then(console.log("Imported sheets data"))
//     .catch(logError);
// }

// export const loadData = loadData;
// export const loadCSV = loadCSV;
// export const loadAllSheetsCSV = loadAllSheetsCSV;
