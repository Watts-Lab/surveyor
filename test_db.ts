/** @format */
const Datastore = require("nedb-promises");
import { Database_Wrapper } from './interfaces'


export default class Nedb implements Database_Wrapper {
  responses: any;
  researchers: any;
  collections = new Object();
  collection: any;

  constructor() {
  }

  set_db(db) {
    this.responses = Datastore.create({
      filename: ".data/responses",
      autoload: true,
      timestampData: false,
    });
  
    this.researchers = Datastore.create({
      filename: '.data/researchers',
      autoload: true,
      timestampData: true,
    });
    
    this.collections['responses'] = this.responses
    this.collections['researchers'] = this.researchers
  }

  set_collection(collection: string) {
    this.collection = this.collections[collection]
  }

  async insert(json_body: string) {
    this.collection.insert(json_body)
  }

  async delete(id: string) {
    this.collection.remove({_id: id})
  }

  async find(query: any) {
    const result = await this.collection.find()
    return result
  }


}



// export const db = {
//   users: new Datastore({
//     filename: ".data/users",
//     autoload: true,
//     timestampData: true,
//   }),
//   surveys: new Datastore({
//     filename: ".data/surveys",
//     autoload: true,
//     timestampData: true,
//   }),
//   responses: new Datastore({
//     filename: ".data/responses",
//     autoload: true,
//     timestampData: true,
//   }),
// };

// type User = {email:string}
// 
// export const createUser = (user:User) => {
//   return new Promise((resolve, reject) => {
//     db.users.insert(user, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };
// 
// export const readUser = (user) => {
//   return new Promise((resolve, reject) => {
//     db.users.find({ id: user.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const updateUser = (user) => {
//   return new Promise((resolve, reject) => {
//     db.users.update({ id: user.id }, user, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const deleteUser = (user) => {
//   return new Promise((resolve, reject) => {
//     db.users.remove({ id: user.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const createSurvey = (survey) => {
//   return new Promise((resolve, reject) => {
//     db.surveys.insert(survey, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };
// 
// export const readSurvey = (survey) => {
//   return new Promise((resolve, reject) => {
//     db.surveys.find({ id: survey.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const updateSurvey = (survey) => {
//   return new Promise((resolve, reject) => {
//     db.surveys.update({ id: survey.id }, survey, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const deleteSurvey = (survey) => {
//   return new Promise((resolve, reject) => {
//     db.surveys.remove({ id: survey.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const createResponse = (response) => {
//   return new Promise((resolve, reject) => {
//     db.responses.insert(response, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };
// 
// export const readResponse = (response) => {
//   return new Promise((resolve, reject) => {
//     db.responses.find({ id: response.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const updateResponse = (response) => {
//   return new Promise((resolve, reject) => {
//     db.responses.update({ id: response.id }, response, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
// 
// export const deleteResponse = (response) => {
//   return new Promise((resolve, reject) => {
//     db.responses.remove({ id: response.id }, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data[0]);
//       }
//     });
//   });
// };
