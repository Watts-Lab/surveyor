export interface Database_Wrapper {
  set_db(db: any): void

  insert(json_body: any, collection: string)
  delete(id: string, collection: string)
  update(filter: any, updateDoc: any, options: any, collection: string)
  find(query: any, collection: string): Promise<any[]>
  export(query: any, collection: string)
}
