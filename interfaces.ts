export interface Database_Wrapper {
    set_db(db: any): void;
    set_collection(collection: string): void;

    insert(json_body: any);
    delete(id: string);
    find(query: any);
}