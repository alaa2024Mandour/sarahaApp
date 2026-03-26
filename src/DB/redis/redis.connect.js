import { createClient } from "redis"
import { REDIS_URL } from "../../../config/config.service.js";

export const redis_client = createClient({
    url: REDIS_URL
});


export const redis_connection = async()=>{
    await redis_client.connect()
    .then(()=>console.log("Redis connected successfully")) 
    .catch((error)=>console.log({msg:"Redis connection faild",error}))
}