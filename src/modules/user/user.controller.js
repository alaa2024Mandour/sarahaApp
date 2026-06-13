import { Router } from "express";
import * as userScervice from "./user.service.js";
import authMiddleware from "../../common/middleware/authentication.js";
import authorization from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import validationMid from "../../common/middleware/validation.js";
import * as userValidation from "./user.validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { MimeEnum } from "../../common/enum/multer.enum.js";

const userRouter = Router({
  caseSensitive: true,
  strict: true,
});

userRouter.post(
  "/signUp",
  multer_host({ file_type: MimeEnum.images }) //multer middleware before validation because multer pars the data from type form data to json not express.json()
    .single("profile_pic"),
  validationMid({ schema: userValidation.signUp_schema }),
  userScervice.signUp,
);

// test sinup with multi pictures
userRouter.post(
  "/signUp/pics",
  multer_host({ file_type: MimeEnum.images }).array("profile_pic", 2),
  validationMid({ schema: userValidation.signUp_schema }),
  userScervice.signUp_with_multi_pictures,
);

// test sinup with multi fields
userRouter.post(
  "/signUp/fields",
  multer_local({
    folder_path: "users",
    file_type: [...MimeEnum.images, ...MimeEnum.docs],
  }).fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "cover_pic", maxCount: 2 },
  ]),
  validationMid({ schema: userValidation.signUp_schema }),
  userScervice.signUp_with_deffirent_feilds,
);

userRouter.post("/signup/gmail", userScervice.signUpWithGmail);

userRouter.post(
  "/signIn",
  validationMid({ schema: userValidation.signIn_schema }),
  userScervice.signIn,
);

userRouter.get(
  "/",
  authMiddleware,
  authorization([RoleEnum.user]),
  userScervice.getMyProfile,
);

userRouter.get("/all", authMiddleware, async (req, res) => {
  const users = await dbService.find({
    model: userModel,
    filter: { confirmed: true },
    select: "_id userName first_name last_name profilePic gender",
  });
  return success.success_response({ res, data: users });
});

userRouter.get(
  "/getUser/:id",
  authMiddleware,
  authorization([RoleEnum.user]),
  userScervice.getProfile,
);

userRouter.post("/refreshToken", userScervice.refreshToken);

userRouter.get(
  "/shareProfile/:id",
  validationMid({ schema: userValidation.shareProfile_schema }),
  userScervice.shareProfile,
);

userRouter.post(
  "/forgotPassword",
  validationMid({ schema: userValidation.forgotPassword_schema }),
  userScervice.forgotPassword,
);

userRouter.patch(
  "/resetPassword",
  validationMid({ schema: userValidation.resetPassword_schema }),
  userScervice.resetPassword,
);

userRouter.patch(
  "/updateProfile",
  validationMid({ schema: userValidation.updateProfile_schema }),
  authMiddleware,
  userScervice.updateProfile,
);

userRouter.patch(
  "/updatePassword",
  validationMid({ schema: userValidation.updatePassword_schema }),
  authMiddleware,
  userScervice.updatePassword,
);

userRouter.post("/logOut", authMiddleware, userScervice.logOut);

userRouter.post(
  "/confirm",
  validationMid({ schema: userValidation.confirmEmial_schema }),
  userScervice.confirmEmail,
);

userRouter.post(
  "/resend",
  validationMid({ schema: userValidation.resendEmial_schema }),
  userScervice.resendEmail,
);

export default userRouter;
