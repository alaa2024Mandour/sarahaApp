import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"
/*
If you need to receive data from query, body, headers, params, etc.,
you can build an object and inject into it keys like "body", "query", etc.,
depending on the source you want to receive the data from.

After that, go to the middleware and loop over this object
to validate the data from each key using the schema assigned to it.
*/
export const signUp_schema = {
    body:joi.object({
        userName:joi.string().min(2).max(50),
        email:joi.string().email({tlds:{allow:false , deny: ['yahoo'] }}),
        password:joi.string().min(8),
        cPassword:joi.string().valid(joi.ref("password")).messages({
        "any.required":"password is required"
    }),
        phone:joi.string(),
        gender:joi.string().valid(...Object.values(GenderEnum)).default("male")
    }).options({presence:"required"}).messages({
        "any.required":"body  is required"
    }),
    
    query:joi.object({
        flag:joi.boolean().truthy("yes" , "y" , "1").falsy("no","n","0")
    }).options({presence:"required"}), 
}

export const signIn_schema = joi.object({
    email:joi.string().email().required(),
    password:joi.string().required(),
})

