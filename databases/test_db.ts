/** @format */
const Datastore = require("nedb-promises");
import { Database_Wrapper } from "../interfaces"


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
      filename: ".data/researchers",
      autoload: true,
      timestampData: true,
    });
    
    this.collections["responses"] = this.responses
    this.collections["researchers"] = this.researchers
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


