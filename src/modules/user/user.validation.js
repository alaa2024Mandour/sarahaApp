import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"
import { general_rules } from "../../common/utils/general.rules.js"

/*
If you need to receive data from query, body, headers, params, etc.,
you can build an object and inject into it keys like "body", "query", etc.,
depending on the source you want to receive the data from.

After that, go to the middleware and loop over this object
to validate the data from each key using the schema assigned to it.
*/
export const signUp_schema = {
    body:joi.object({
        userName:general_rules.userName,
        email:general_rules.email,
        password:general_rules.password,
        cPassword:general_rules.cPassword,
        phone:general_rules.phone,
        gender:general_rules.gender
    }).options({presence:"required"}).messages({
        "any.required":"body  is required"
    }),

    file:general_rules.file, 

    // files:joi.array().max(2).items(general_rules.file).required(),  // if you recive multibil files from the same field

    // files:joi.object({   // if you recive multibel files from the multi field
    //     cover_pic:joi.array().max(2).items(general_rules.file).required(),

    //     profile_pic:joi.array().max(1).items(general_rules.file).required()
        
    // }).required().messages({
    //     'any.required':"file is required"
    // }),
    
    query:joi.object({
        flag:joi.boolean().truthy("yes" , "y" , "1").falsy("no","n","0")
    }).options({presence:"required"}), 
}

export const signIn_schema = {
    body:joi.object({
    email:general_rules.email.required(),
    password:general_rules.password.required(),
})
}

export const shareProfile_schema = {
    params:joi.object({
    id:general_rules.id.required(),
})
}

