import { Router } from "express";
import * as userScervice from "./user.service.js";
import  authMiddleware  from "../common/middleware/auth.js";

const userRouter = Router()

userRouter.post("/signUp",userScervice.signUp)
userRouter.post("/signIn",userScervice.signIn)
userRouter.get("/",authMiddleware,userScervice.getProfile)

export default userRouter