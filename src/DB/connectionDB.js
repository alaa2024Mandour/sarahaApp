import mongoose from "mongoose";


const checkConnection = async () => {
    return await mongoose.connect("mongodb://localhost:27017/sarahaApp")
.then(()=>{
        console.log("DB connecting successfully");
    })
    .catch(()=>{
        console.log("DB connecting Failed");
    })    
}

export default checkConnection;