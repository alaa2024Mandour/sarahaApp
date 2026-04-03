import mongoose from "mongoose";
import { ONLINE_DB_URL } from "../../config/config.service.js";


const checkConnection = async () => {
    return await mongoose.connect(ONLINE_DB_URL)
.then(()=>{
        console.log("DB connecting successfully");
    })
    .catch(()=>{
        console.log("DB connecting Failed");
    })    
}

export default checkConnection;