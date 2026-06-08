import dotenv from "dotenv"
import {resolve} from "node:path"

const NODE_ENV = process.env.NODE_ENV

const path_env={
    development:".env.development",
    production:".env.production"
}

dotenv.config({path:resolve(`config/${path_env[NODE_ENV]}`)})



export const PORT = process.env.PORT
export const SECRET_KEY = process.env.SECRET_KEY
export const DB_URL = process.env.DB_URL
export const ONLINE_DB_URL = process.env.ONLINE_DB_URL
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
export const CLUDINARY_CLOUD_NAME = process.env.CLUDINARY_CLOUD_NAME
export const CLUDINARY_API_KEY = process.env.CLUDINARY_API_KEY
export const CLUDINARY_API_SECRET = process.env.CLUDINARY_API_SECRET
export const REDIS_URL = process.env.REDIS_URL
export const PREFIX = process.env.PREFIX
export const APPE_MAIL = process.env.APPE_MAIL
export const SENDING_EMAIL_PASSWORD = process.env.SENDING_EMAIL_PASSWORD
export const WHITE_LIST = process.env.WHITE_LIST?.split(",")||[]
