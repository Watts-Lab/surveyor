export interface Database_Wrapper {
    set_db(db: any): void;

    insert(json_body: any, collection: string);
    delete(id: string, collection: string);
    find(query: any, collection: string);
    export(query: any, collection: string);
}