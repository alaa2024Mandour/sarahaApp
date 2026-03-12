import joi from "joi"
import { GenderEnum } from "../enum/user.enum.js";
export const general_rules = {
    userName: joi.string().min(2).max(50),

    email: joi.string().email({ tlds: { allow: false, deny: ["yahoo"] } }),

    password: joi
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
        .message({
            "string.pattern.base":
                "Invalid passwords , must contain numbers , lower and upper letters and spetial characters ",
        }),

    cPassword: joi.string().valid(joi.ref("password")).messages({
        "any.required": "password is required",
    }),

    phone: joi
        .string()
        .regex(/^(01|02001|\+201)[0125][0-9]{8}$/)
        .message({
            "string.pattern.base": "Invalid phone number",
        }),

    gender: joi
        .string()
        .valid(...Object.values(GenderEnum))
        .default("male"),

    file: joi
        .object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number(),
        })
        .required()
        .messages({
            "any.required": "file is required",
        }),
};
