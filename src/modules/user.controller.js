import { Router } from "express";
import * as userScervice from "./user.service.js";

const userRouter = Router()

userRouter.post("/signUp",userScervice.signUp)
userRouter.post("/signIn",userScervice.signIn)

export default userRouter