import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/db.service.js"
import * as success from "../../common/utils/successRes.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js"
import { v4 as uuidv4 } from 'uuid';
import * as authService from "../../common/utils/auth.service.js"
import {OAuth2Client} from'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js"
import * as configService from "../../../config/config.service.js"
import cloudinary from "../../common/utils/cloudinary.js"

export const signUp = async (req,res) => {
        console.log(req.file);
        
        const {secure_url,public_id} = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder:"sarahaApp/users/profile_pic",
                resource_type:"image"  // default value it is an image 
                // public_id:"ahmed",  // if you want to control file name
                // unique_filename:true  // by default true
            }
        )
        
        const {userName,email,password,cPassowrd,gender,phone} = req.body
        if(await dbService.findOne({model:userModel,filter:{email}})){
            await cloudinary.uploader.destroy(public_id)  // if user exist don't upload profile_pic again
            throw new Error("email aready exist",{cause:400});
        }
                console.log(req.file);
        
                const user = await dbService.create({
                model:userModel,
                data:{
                    userName,
                    email,
                    password:Hash({plainText:password,saltRounds:12}),
                    phone:encrypt(phone),
                    gender,
                    profilePic:{secure_url,public_id},
                    visitsCount:0
                }
            });
            return success.success_response({res,status:201,data:user})
}

export const signUp_with_multi_pictures = async (req,res) => {
        const {userName,email,password,cPassowrd,gender,phone} = req.body
        if(!await dbService.findOne({model:userModel,filter:{email}})){
                console.log(req.files);

                const profilePics = []

                for (const element of req.files) {
                    profilePics.push(element.path)
                }

                const user = await dbService.create({
                model:userModel,
                data:{
                    userName,
                    email,
                    password:Hash({plainText:password,saltRounds:12}),
                    phone:encrypt(phone),
                    gender,
                    profilePic:profilePics,
                    visitsCount:0
                }
            });
            return success.success_response({res,status:201,data:user})
        }
        throw new Error("email aready exist",{cause:400});
}
export const signUp_with_deffirent_feilds = async (req,res) => {
        const {userName,email,password,cPassowrd,gender,phone} = req.body
        if(!await dbService.findOne({model:userModel,filter:{email}})){
            console.log("-------------------");
            
                // console.log(req.files);
                const docs = [] 

                for (const element of req.files.docs) {
                    // console.log(element.path);
                    
                    docs.push(element.path)
                }

                const user = await dbService.create({
                model:userModel,
                data:{
                    userName,
                    email,
                    password:Hash({plainText:password,saltRounds:12}),
                    phone:encrypt(phone),
                    gender,
                    profilePic:req.files.profile_pic[0].path,
                    docs:docs,
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
            secret_key:"configService.ACCESS_SECRET_KEY",
            options:{
                expiresIn: "1h", // this token will be expired after 1 hour
                // noTimestamp:true, // remove initiate time the time token generate in it
                //notBefore:60*60 ,// this token not be valid befor 1 hour
                jwtid:uuidv4()  // to generate random id for the token 
            }
        })
        const refresh_token = authService.generateToken(
            {
                payload:{
                id:user._id,
                email:user.email
            },
            secret_key:configService.REFRESH_SECRET_KEY,
            options:{
                expiresIn: "1y",
            }
        })
        success.success_response({res,message:"logged in successfully",data:{access_token, refresh_token}})
}

export const refreshToken = async (req,res) => {
        const {authorization} = req.headers
        
            if(!authorization){
                throw new Error("token is required from the headers");
            }
        
            const [prefix , token] = authorization.split(" ");
            if(prefix !== "Bearer"){
                throw new Error("invalid token prefix");
            }
            const decoded = authService.verifyToken({token:token,secret_key:configService.REFRESH_SECRET_KEY})

            if (!decoded || !decoded?.id){
                throw new Error("invalid token");
            }

            const user = await findById({
                model:userModel,
                id:decoded.id
            })
        
        const access_token = authService.generateToken(
            {
                payload:{
                id:user._id,
                email:user.email
            },
            secret_key:configService.ACCESS_SECRET_KEY,
            options:{
                expiresIn: "1h",
            }
        })
        success.success_response({res,data:{access_token}})
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
        const visited_user = await dbService.findOneAndUpdate({
            model:userModel,
            filter:{_id:id},
            update:{
                $inc: { visitsCount: 1 } ,
            }
        });

                
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

// export const logOut = async (req,res) => {
//     req.user.changeCredetial = new Date()

//     await req.user.save()
// }

