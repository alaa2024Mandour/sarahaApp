import mongoose, { Types } from "mongoose";

const revokTokenSchema = new mongoose.Schema({
    tokenId:{
        type : String,
        required:true,
        trim:true
    },
    userId:{
        type : Types.ObjectId,
        ref:"user",
        required:true
    },
    expireAt:{
        type : Date,
        required:true
    },
},
{
    timestamps:true,
    strictQuery:true,
}
);

revokTokenSchema.index("expireAt",{expireAfterSeconds:0})

const revokTokenModel = mongoose.models.revokToken || mongoose.model("revokToken",revokTokenSchema);

export default  revokTokenModel;