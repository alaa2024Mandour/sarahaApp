import userModel from "../DB/models/user.model.js"
import * as dbService from "../DB/db.service.js"
import * as success from "../common/utils/successRes.js"


export const signUp = async (req,res) => {
        const {userName,email,password,gender} = req.body
        if(!await dbService.findOne({model:userModel,filter:{email}})){
            const user = await dbService.create({
                model:userModel,
                data:{userName,email,password,gender}
            });
            success.success_response({res,status:201,data:user})
            // return res.status(201).json({message:"done" , user})
        }
        throw new Error("email aready exist",{cause:400});
        // return res.status(409).json({message:"email aready exist"})
}

export const signIn = async (req,res) => {
        const {email,password} = req.body
        const user = await dbService.findOne({model:userModel,filter:{email}})
        if(!user){
            throw new Error("email not exist you need to creat an acount",{cause:404});
            // return res.status(404).json({message:"email not exist you need to creat an acount" })
        }
        if(password != user.password){
            throw new Error("Invalid password",{cause:400});
            // return res.status(400).json({message:"Invalid password"})
        }
        success.success_response({res,message:"logged in successfully"})
}