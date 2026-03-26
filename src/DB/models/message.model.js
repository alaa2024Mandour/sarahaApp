import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{
        type : String,
        required:true,
        minLength:1,
    },
    userId:{
        type : Types.ObjectId,
        ref:"user",
        required:true,
    },
    attachments:[Object],
},
{
    timestamps:true,
    strictQuery:true,
    versionKey:"versionKey",
    optimisticConcurrency:true, // to update version
    toJSON:true,
    toObject:true
}
);


/* if message model exist use it else create it */
const messageModel = mongoose.models.message || mongoose.model("message",messageSchema);

messageModel.syncIndexes()
export default  messageModel;