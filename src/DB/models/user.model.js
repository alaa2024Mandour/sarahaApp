import mongoose from "mongoose";
import { GenderEnum, ProviderEnum } from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema({
    first_name:{
        type : String,
        required:true,
        maxLength:8,
        minLength:2,
        trim:true
    },
    last_name:{
        type : String,
        required:true,
        maxLength:8,
        minLength:2,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type : String,
        required:true,
        minLength:8,
        trim:true
    },
    phone:{
        type : String,
        required:true,
    },
    gender:{
        type:String,
        required:true,
        enum:Object.values(GenderEnum),
        default:GenderEnum.male
    },
    provider:{
        type:String,
        enum:Object.values(ProviderEnum),
        default:ProviderEnum.system
    },
    profilePic:String,
    confirmed:Boolean
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

userSchema.virtual("userName")
.get(
    function () {
        return this.first_name + " " + this.last_name
    })
.set(
    function (value){
        const[first,last] = value.split(" ");
        this.set({first_name:first,last_name:last})
    }
)

/* if user model exist use it else create it */
const userModel = mongoose.models.user || mongoose.model("user",userSchema);

userModel.syncIndexes()
export default  userModel;