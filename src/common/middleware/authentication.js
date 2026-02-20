import * as authService from "../utils/auth.service.js"
import {findById} from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";
const authMiddleware = async (req, res, next) => {
    const {authorization} = req.headers

    if(!authorization){
        throw new Error("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");
    if(prefix !== "Bearer"){
        throw new Error("invalid token prefix");
    }
    const decoded = authService.verifyToken({token:token,secret_key:"alaa123"})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");
    }

    const user = await findById({
        model:userModel,
        id:decoded.id
    })

    req.user = user

    next()
};

export default authMiddleware;