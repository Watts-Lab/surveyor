let mongodb, { MongoClient, collection, ObjectID } = require("mongodb");
import { Dictionary } from 'express-serve-static-core';
import { Database_Wrapper } from '../interfaces'

export default class Mongo implements Database_Wrapper {
  readonly db_uri: string;
  collection: string;
  client: any
  db: string
  
  constructor(env_config: Dictionary<any>) {
    this.db_uri = env_config.URI;
    this.client = MongoClient.connect(
      env_config.URI,
      {
        tlsCAFile: `rds-combined-ca-bundle.pem`
      },
    );
    this.test_database()
  }

  set_db(db: string): void {
    this.db = db
  }
  
  set_collection(collection: string): void {
    this.collection = collection
  }

  async test_database() {
    try {
      // Connect the client to the server
      await this.client.db("admin").command({ ping: 1 });
      console.log("Connected successfully to mongodb server");
    } catch {
      console.dir
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  async set_up() {
    const database = this.client.db(this.db)
    const collection_obj = database.collection(this.collection)
    return collection_obj
  }

  async insert(json_body: any) {
    const collection_obj = await this.set_up()
    await collection_obj.insertOne(json_body)
    console.log('Inserted Document Sucessfully')
  }

  async delete(id: string) {
    const collection_obj = await this.set_up()
    await collection_obj.deleteOne({ _id: new ObjectID(id)})
    console.log('Document Deleted Sucessfully')
  }

  async find(query: any) {
    const collection_obj = await this.set_up()
    const queries = await collection_obj.find(query).toArray()
    return queries
  }

  async update(filter: any, updateDoc: any, options: any) {
    const collection_obj = await this.set_up()
    const result = await collection_obj.updateOne(filter, updateDoc, options)
  }
} 

