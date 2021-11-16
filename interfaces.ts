export interface Database_Wrapper {
    set_db(db: any): void;

    insert(json_body: any, collection: string);
    delete(id: string, collection: string);
    update(filter: any, updateDoc: any, options: any, collection: string);
    find(query: any, collection: string);
    export(query: any, collection: string);
}

// default if .env is missing
export interface env {
    PORT: number,
    MONGO: boolean,
    URI: string,
    DB: string,
    RANDOM: string
  }