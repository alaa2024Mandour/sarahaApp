import { Router } from "express";
import * as userScervice from "./user.service.js";
import  authMiddleware  from "../common/middleware/authentication.js";
import authorization from "../common/middleware/authorization.js";
import { RoleEnum } from "../common/enum/user.enum.js";

const userRouter = Router()

userRouter.post("/signUp",userScervice.signUp)
userRouter.post("/signup/gmail",userScervice.signUpWithGmail)
userRouter.post("/signIn",userScervice.signIn)
userRouter.get("/",authMiddleware,authorization([RoleEnum.user]),userScervice.getProfile)

export default userRouter