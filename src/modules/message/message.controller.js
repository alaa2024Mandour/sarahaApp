import { Router } from "express";
import { multer_host } from "../../common/middleware/multer.js";
import { MimeEnum } from "../../common/enum/multer.enum.js";
import * as messageService from "../message/message.service.js"
import * as messageValidation from "../message/message.validation.js"
import validationMid from "../../common/middleware/validation.js";
import authMiddleware from "../../common/middleware/authentication.js";


const messageRouter = Router()


messageRouter.post(
    "/sendMessage",
    multer_host({
        file_type:[...MimeEnum.docs,...MimeEnum.images],
    }).array("attachments",3),
    validationMid({schema:messageValidation.sendMessage_schema}),
    messageService.sendMessages
)

messageRouter.get(
    "/getUserMessages",
    authMiddleware,
    messageService.getMessages
)

export default messageRouter