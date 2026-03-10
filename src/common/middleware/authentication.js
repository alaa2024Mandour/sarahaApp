import * as authService from "../utils/auth.service.js"
import {findById} from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";
import * as configService from "../../../config/config.service.js";

const authMiddleware = async (req, res, next) => {
    const {authorization} = req.headers

    if(!authorization){
        throw new Error("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");
    if(prefix !== "Bearer"){
        throw new Error("invalid token prefix");
    }
    const decoded = authService.verifyToken({token:token,secret_key:configService.ACCESS_SECRET_KEY})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");
    }

    const user = await findById({
        model:userModel,
        id:decoded.id
    })

    if (!user){
        throw new Error("invalid token");
    }

    const logOutTime = user?.changeCredetial?.getTim();
    const logInTime = decoded.jti*1000;

    if(logOutTime > logInTime){
        throw new Error("invalid token");
    }

    req.user = user
    req.decoded = decoded

    next()
};

export default authMiddleware;