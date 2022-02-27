export type user_token =  { username: string, admin: string }
export type env_file = {
    PORT: number,
    URI?: string,
    DB?: string,
    TOKEN_KEY: string,
    SECRET_KEY: string,
    ENCRYPT_KEY: string,
    IV_KEY: string,
    DOMAIN: string,
    PROD: boolean
}