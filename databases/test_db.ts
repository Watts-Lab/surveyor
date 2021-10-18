/** @format */
const Datastore = require("nedb-promises");
import { Database_Wrapper } from "../interfaces"


export default class Nedb implements Database_Wrapper {
  /* WILL BE DEPRECATED*/
  responses: any;
  researchers: any;
  collections = new Object();

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

  async insert(json_body: string, collection: string) {
    const collection_obj = this.collections[collection]
    collection_obj.insert(json_body)
  }

  async delete(id: string, collection: string) {
    const collection_obj = this.collections[collection]
    collection_obj.remove({_id: id})
  }

  async find(query: any, collection: string) {
    const collection_obj = this.collections[collection]
    const result = await collection_obj.find()
    return result
  }


  async update(filter: any, updateDoc: any, options: any, collection: string) {
    console.log('Does Nothing')
  }

  async export(collection: string) {
    const collection_obj = this.collections[collection]
    const result = await collection_obj.find()
    return result
  }

}


