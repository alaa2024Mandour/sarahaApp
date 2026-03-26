import { redis_client } from "./redis.connect.js";

export const set = async({key,value,ttl})=>{
    try {
        const data = typeof value == "string" ? value : JSON.stringify(value);
        return ttl ? await redis_client.set(key,data,{EX:ttl}) : await redis_client.set(key,data)
    } catch (error) {
        console.log({error,mes:"error on set cash operation"});
        
    }
}
export const update = async({key,value,ttl})=>{
    try {
        if(redis_client.exists(key)) return 0;
        return await set({key,value,ttl});
    } catch (error) {
        console.log({error,mes:"error on update cash operation"});
        
    }
}
export const get = async(key)=>{
    try {
        try {
            return JSON.parse(await redis_client.get(key))  // if the type of data is an object
        } catch (error) {
            return await redis_client.get(key) // if the last line return error so the data was string
        }
    } catch (error) {
        console.log({error,mes:"error on get cash operation"});
        
    }
}
export const ttl = async(key)=>{
    try {
        return await redis_client.ttl(key)
    } catch (error) {
        console.log({error,mes:"error on ttl cash operation"});
        
    }
}
export const exists = async(key)=>{
    try {
        return await redis_client.exists(key)
    } catch (error) {
        console.log({error,mes:"error on exsits cash operation"});
        
    }
}
export const expire = async({key,ttl})=>{
    try {
        return await redis_client.expire({key,ttl})
    } catch (error) {
        console.log({error,mes:"error on expire cash operation"});
        
    }
}
export const del = async(key)=>{
    try {
        return await redis_client.del(key)
    } catch (error) {
        console.log({error,mes:"error on del cash operation"});
        
    }
}

export const keys = async(pattern)=>{
    try {
        return await redis_client.keys(`${pattern}*`)
    } catch (error) {
        console.log({error,mes:"error on keys cash operation"});
        
    }
}


export const incr = async(key)=>{
    try {
        return await redis_client.incr(key)
    } catch (error) {
        console.log({error,mes:"error on increament cash operation"});
        
    }
}
