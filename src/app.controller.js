import express from 'express';
import checkConnection from './DB/connectionDB.js';
// import userModel from './DB/models/user.model.js';
import cors from "cors" // to allow frontend or google service to connect my backend like sign in with google
import { PORT, WHITE_LIST } from '../config/config.service.js';
import userRouter from './modules/user/user.controller.js';
import { redis_connection } from './DB/redis/redis.connect.js';
import messageRouter from './modules/message/message.controller.js';
import "../src/modules/user/user.cron.js"
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express()
const port = PORT



const corsOptions = {
    origin:function(origin,callBack){
        if([...WHITE_LIST,undefined].includes(origin)){
            callBack(null,true)
        }else{
            callBack(new Error ("not allow"))
        }
    }
}

const limiter = rateLimit({
    windowMs:60*2*1000,
    limit:20,
    message:"too many requests try again after 5 minuts" ,
    statusCode:400,
    // handler:(req,res,next)=>{  // to handel your response & it override message and ststusCode ☝
    //     return res.json({message:"try again later"})
    // },
    legacyHeaders:false // to hide rateLimit details from postman headers or any platform
})
const bootstrap = () => {
    app.use( 
        cors(corsOptions), 
        helmet(),
        limiter,
        express.json()
    ) 
    app.use("/uploads",express.static("uploads"))
    app.get('/', (req, res) => res.send('Hello World!'))
    // userModel

    app.use("/users",userRouter)
    app.use("/messages",messageRouter)

    checkConnection()
    redis_connection()
    app.use("{/*demo}" , (req)=>{
        throw new Error(`Route ${req.originalUrl} not found`,{cause:404});
        
    })

    app.use((err,req,res,next)=>{
        res.status(err.cause || 500).json({message:"server error",error:err.message})
    })
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default bootstrap;