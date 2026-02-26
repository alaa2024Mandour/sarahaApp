import { Router } from "express";
import * as userScervice from "./user.service.js";
import  authMiddleware  from "../../common/middleware/authentication.js";
import authorization from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import validationMid from "../../common/middleware/validation.js";
import * as userValidation from "./user.validation.js";

const userRouter = Router()

userRouter.post("/signUp",validationMid({schema:userValidation.signUp_schema}),userScervice.signUp)
userRouter.post("/signup/gmail",userScervice.signUpWithGmail)
userRouter.post("/signIn",validationMid({schema:userValidation.signIn_schema}),userScervice.signIn)
userRouter.get("/",authMiddleware,authorization([RoleEnum.user]),userScervice.getProfile)

export default userRouter