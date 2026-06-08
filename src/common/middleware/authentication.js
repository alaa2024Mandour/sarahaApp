import * as authService from "../utils/auth.service.js"
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";
import * as configService from "../../../config/config.service.js";
import * as redisService from "../../DB/redis/redis.service.js";
import { revokedToken_key } from "../../modules/user/user.service.js";

const authMiddleware = async (req, res, next) => {
    const {authorization} = req.headers

    if(!authorization){
        throw new Error("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");
    if(prefix !== configService.PREFIX){
        throw new Error("invalid token prefix");
    }
    const decoded = authService.verifyToken({token:token,secret_key:configService.ACCESS_SECRET_KEY})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");
    }

    const user = await dbService.findById({
        model:userModel,
        id:decoded.id
    })

    if (!user){
        throw new Error("invalid token");
    }

    const logOutTime = user?.changeCredetial?.getTime();
    const logInTime = decoded.iat*1000;

    if(logOutTime > logInTime){
        throw new Error("invalid token");
    }

    // const revokToken = await dbService.findOne({
    //         model:revokTokenModel,
    //         filter:{tokenId:decoded.jti}  // if tokenId exist so you loged out
    //     })
                

    const revokToken = await redisService.get(revokedToken_key({userId:user.id,jti:decoded.jti}));

    if(revokToken){
            throw new Error("invalid revoked token");
        }

    req.user = user
    req.decoded = decoded

    next()
};

export default authMiddleware;