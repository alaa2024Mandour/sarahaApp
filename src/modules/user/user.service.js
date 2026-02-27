import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/db.service.js"
import * as success from "../../common/utils/successRes.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js"
import { v4 as uuidv4 } from 'uuid';
import * as authService from "../../common/utils/auth.service.js"
import {OAuth2Client} from'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js"
import { SECRET_KEY } from "../../../config/config.service.js"

export const signUp = async (req,res) => {
        const {userName,email,password,cPassowrd,gender,phone} = req.body
        if(!await dbService.findOne({model:userModel,filter:{email}})){
                console.log(req.file);

                const user = await dbService.create({
                model:userModel,
                data:{
                    userName,
                    email,
                    password:Hash({plainText:password,saltRounds:12}),
                    phone:encrypt(phone),
                    gender,
                    visitsCount:0
                }
            });
            return success.success_response({res,status:201,data:user})
        }
        throw new Error("email aready exist",{cause:400});
}

export const signUpWithGmail = async (req,res) => {
    const {idToken} = req.body
    console.log(idToken);
    
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: "746397644004-0lrjg9attdmq6bfpeo5nmcpfjij20s0m.apps.googleusercontent.com",  
    });
    const payload = ticket.getPayload();
    const {email,name,picture,email_verified} = payload;

    let user = await dbService.findOne({model:userModel , filter:{email}})
    
    if (!user){
        user = await dbService.create({
            model:userModel ,
            data:{
                email,
                userName:name,
                profilePic:picture,
                confirmed:email_verified,
                visitsCount:0,
                provider:ProviderEnum.google
            }
        })
    }

    if (user && user.provider ==  ProviderEnum.system ){
        throw new Error("please logIn using the system form");
    }

    const access_token = authService.generateToken(
            //payload (data will be encrypted into the token)
            {
                payload:{
                id:user._id,
                email:user.email
            },

            secret_key:SECRET_KEY,

            options:{
                expiresIn: "1day",
            }
        })
        success.success_response({res,message:"logged in successfully",data:{access_token}})

}

export const signIn = async (req,res) => {
        const {email,password} = req.body
        const user = await dbService.findOne({model:userModel,filter:{email}})
        if(!user){
            throw new Error("email not exist you need to creat an acount",{cause:404});
        }
        if(!Compare({plainText:password,cipherText:user.password})){
            throw new Error("Invalid password",{cause:400});
        }

        const access_token = authService.generateToken(
            //payload (data will be encrypted into the token)
            {
                payload:{
                id:user._id,
                email:user.email
            },

            secret_key:"alaa123",

            options:{
                expiresIn: "1h", // this token will be expired after 1 hour
                noTimestamp:true, // remove initiate time the time token generate in it
                //notBefore:60*60 ,// this token not be valid befor 1 hour
                jwtid:uuidv4()  // to generate random id for the token 
            }
        })
        success.success_response({res,message:"logged in successfully",data:{access_token}})
}

export const getProfile = async (req,res) => {
        const {id} = req.params

        // if the id which given from the user token == visited user id so its the same person so don't increas his id and return user data only....
        /* 
        بس  هنا مش هتنفع علشان علشان احنا مش عايزين نجبر اليوزر
        id انه يكون عامل اكونت عندي فا بالتالي ملهوش توكن ناخد منه ال 
         */

        // if(id == req.user.id){
        //     return success.success_response({
        //         res,
        //         message:"done",
        //         data:{
        //             ...req.user._doc,
        //             phone:decrypt(req.user._doc.phone)
        //         }})
        // }
        const visited_user = await userModel.findByIdAndUpdate(
                id,
                { $inc: { visitsCount: 1 } },
                { new: true }
            );
        if(visited_user){
            return success.success_response({
                res,
                message:"done",
                data:{
                    userName:visited_user.first_name+" "+visited_user.last_name,
                    email:visited_user.email,
                    visitsCount:visited_user.visitsCount,
                    phone:decrypt(visited_user.phone)
                }})
        }
        throw new Error("no user found");
        
        
}