let mongodb, { MongoClient, collection, ObjectID } = require("mongodb");
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env_file } from '../@types';
import { Database_Wrapper } from '../interfaces'

export default class Mongo implements Database_Wrapper {
  db_uri: string;
  collection: string;
  client: any
  db: string
  
  constructor() {    
  }

  
  static async create(env_config: env_file) {
    const myMongo = new Mongo()
    await myMongo.init(env_config)
    return myMongo
  }

  private async init(env_config: env_file) {
    if (env_config.PROD) {
      this.db_uri = env_config.URI
      this.db = env_config.DB
    } else {
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: this.db
        }
      })
      
      this.db_uri = mongod.getUri();
    }

    this.client = new MongoClient(this.db_uri);
    this.test_database()  
  }

  set_db(db: string): void {
    this.db = db
  }

  async test_database() {
    try {
      // Connect the client to the server
      await this.client.connect();
      await this.client.db("admin").command({ ping: 1 });
      console.log("Connected successfully to mongodb server");
    } catch {
      console.dir
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  async set_up(collection: string) {
    await this.client.connect()
    const database = this.client.db(this.db)
    const collection_obj = database.collection(collection)
    return collection_obj
  }

  async insert(json_body: any, collection: string) {
    const collection_obj = await this.set_up(collection)
    await collection_obj.insertOne(json_body)
    await this.client.close()
    console.log('Inserted Document Sucessfully')
  }

  async delete(id: string, collection: string) {
    const collection_obj = await this.set_up(collection)
    await collection_obj.deleteOne({ _id: new ObjectID(id)}) 
    await this.client.close()
    console.log('Document Deleted Sucessfully')
  }

  async find(query: any, collection: string) {
    const collection_obj = await this.set_up(collection)
    const queries = await collection_obj.find(query).toArray()
    await this.client.close()
    return queries
  }

  async update(filter: any, updateDoc: any, options: any, collection: string) {
    const collection_obj = await this.set_up(collection)
    const result = await collection_obj.updateOne(filter, updateDoc, options)
    await this.client.close()
  }
  
  async export(collection: string) {
    const collection_obj = await this.set_up(collection)
    const queries = await collection_obj.find({}).toArray()
    await this.client.close()
    return queries
  }
} 

export let Db_Wrapper: Database_Wrapper = null

export const startDBServer = async (env_config: env_file) => {
  Db_Wrapper = await Mongo.create(env_config)
}
