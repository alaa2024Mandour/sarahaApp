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

        password:joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
        .message({
            "string.pattern.base":"Invalid passwords , must contain numbers , lower and upper letters and spetial characters "
        }),

        cPassword:joi.string().valid(joi.ref("password")).messages({
        "any.required":"password is required"
    }),

        phone:joi.string()
        .pattern(/^(01|02001|\+201)[0125][0-9]{8}$/)
        .message({
            "string.pattern.base":"Invalid phone number"
        }),

        gender:joi.string().valid(...Object.values(GenderEnum)).default("male"),
        // file:joi.object()
    }).options({presence:"required"}).messages({
        "any.required":"body  is required"
    }),
    
    query:joi.object({
        flag:joi.boolean().truthy("yes" , "y" , "1").falsy("no","n","0")
    }).options({presence:"required"}), 
}

export const signIn_schema = {
    body:joi.object({
    email:joi.string().email().required(),
    password:joi.string().required(),
})
}

