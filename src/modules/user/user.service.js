import userModel from "../../DB/models/user.model.js";
import * as dbService from "../../DB/db.service.js";
import * as success from "../../common/utils/successRes.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { v4 as uuidv4 } from "uuid";
import * as authService from "../../common/utils/auth.service.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import * as configService from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";
import revokTokenModel from "../../DB/models/revokToken.model.js";
import * as redisService from "../../DB/redis/redis.service.js";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email.js";
import { eventEmitter } from "../../common/utils/email/email.events.js";
import { emailTemplate } from "../../common/utils/email/email.template.js";
import { EmailEnum } from "../../common/utils/email/emial.enum.js";
import { Types } from "mongoose";

export const revokedToken_key = ({ userId, jti }) => {
  return `revokedToken::${userId}::${jti}`;
};

export const getUser_revokedKeys = ({ userId }) => {
  return `revokedToken::${userId}`;
};

export const profile_key = ({ userId }) => {
  return `profile::${userId}`;
};

export const otp_key = ({ email, subject = EmailEnum.confirmeEmail }) => {
  return `otp::${email}::${subject}`;
};

export const max_tries_otp = ({ email }) => {
  return `${otp_key({ email })}::max_tries`;
};

export const blocked_otp = ({ email }) => {
  return `${otp_key({ email })}::blocked`;
};

const sendEmailOTP = async ({ email, subject }) => {
  const otpBlocked = await redisService.ttl(blocked_otp({ email }));
  if (otpBlocked > 0) {
    throw new Error(
      `you are bloked now , resend otp after ${otpBlocked} seconds `,
    );
  }

  const otpTTL = await redisService.ttl(otp_key({ email }));
  if (otpTTL > 0) {
    throw new Error(`you can resend otp after ${otpTTL} seconds `);
  }

  const maxOTP = await redisService.get(max_tries_otp({ email }));
  if (maxOTP >= 3) {
    await redisService.set({ key: blocked_otp({ email }), value: 1, ttl: 60 });
    throw new Error(`you have exceeded the maximum nuber of tries`);
  }

  const OTP = await generateOTP();

  eventEmitter.emit(EmailEnum.confirmeEmail, async () => {
    await sendEmail({
      to: email,
      subject: "welcome to our app",
      html: emailTemplate(OTP),
    });

    await redisService.incr(max_tries_otp({ email }));

    await redisService.set({
      key: otp_key({ email, subject }),
      value: Hash({ plainText: OTP, saltRounds: 12 }),
      ttl: 60 * 5, //5m
    });
  });
};

export const signUp = async (req, res) => {
  let secure_url;
  let public_id;
  if (req.file) {
    const uploadedPic = await cloudinary.uploader.upload(req.file.path, {
      folder: "sarahaApp/users/profile_pic",
      resource_type: "image", // default value it is an image
      // public_id:"ahmed",  // if you want to control file name
      // unique_filename:true  // by default true
    });

    secure_url = uploadedPic.secure_url;
    public_id = uploadedPic.public_id;
  }

  const { userName, email, password, cPassowrd, gender, phone } = req.body;
  if (await dbService.findOne({ model: userModel, filter: { email } })) {
    await cloudinary.uploader.destroy(public_id); // if user exist don't upload profile_pic again
    throw new Error("email aready exist", { cause: 400 });
  }

  const user = await dbService.create({
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({ plainText: password, saltRounds: 12 }),
      phone: encrypt(phone),
      gender,
      profilePic: req.file ? { secure_url, public_id } : undefined,
      visitsCount: 0,
    },
  });

  const OTP = await generateOTP();
  eventEmitter.emit(EmailEnum.confirmeEmail, async () => {
    await sendEmail({
      to: email,
      subject: "welcome to our app",
      html: emailTemplate(OTP),
    });

    await redisService.set({
      key: otp_key({ email, subject: EmailEnum.confirmeEmail }),
      value: Hash({ plainText: OTP, saltRounds: 12 }),
      ttl: 60 * 5, //5m
    });

    await redisService.set({
      key: max_tries_otp({ email }),
      value: 1,
      ttl: 60 * 5 * 3, //3m // بياخد دقيقه وانا عطياله انه يحاول 3 مررات بس فا دا يبقي وقته مجمل الوقت  otpعلشان ال
    });
  });

  return success.success_response({ res, status: 201, data: user });
};

export const confirmEmail = async (req, res) => {
  const { email, code } = req.body;

  const otpValue = await redisService.get(otp_key({ email }));

  if (!otpValue) {
    throw new Error("otp expired");
  }

  if (!Compare({ plainText: code, cipherText: otpValue })) {
    throw new Error(" invalid otp ");
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      confirmed: { $ne: true }, // make sure that this email don't have confirmed field
      provider: ProviderEnum.system,
    },
    update: { confirmed: true },
  });

  if (!user) {
    throw new Error(" user not exist ");
  }

  await redisService.del(otp_key({ email }));
  success.success_response({ res, mes: "email confirmed successfully" });
};

export const resendEmail = async (req, res) => {
  const { email } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      confirmed: { $ne: true }, // make sure that this email don't have confirmed field
      provider: ProviderEnum.system,
    },
  });

  if (!user) {
    throw new Error(" user not exist or already confirmed ");
  }

  await sendEmailOTP({ email, subject: EmailEnum.confirmeEmail });

  success.success_response({ res, mes: "otp sent successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.system,
    },
  });
  if (!user) {
    throw new Error(" user not exist or you have an account with google ");
  }

  await sendEmailOTP({ email, subject: EmailEnum.forgotPassword });

  return success.success_response({
    res,
    mes: "forgotPassword otp sent successfully",
  });
};

export const resetPassword = async (req, res) => {
  let { email, code, password } = req.body;

  const otpValue = await redisService.get(
    otp_key({ email, subject: EmailEnum.forgotPassword }),
  );

  if (!otpValue) {
    throw new Error("otp expired");
  }

  if (!Compare({ plainText: code, cipherText: otpValue })) {
    throw new Error("invalid otp");
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.system,
    },
    update: {
      password: Hash({ plainText: password }),
      changeCredetial: new Date(),
    },
  });

  if (!user) {
    throw new Error("user not exist or invalid password", { cause: 400 });
  }
  await redisService.del(otp_key({ email, subject: EmailEnum.forgotPassword }));
  return success.success_response({ res });
};

export const signUp_with_multi_pictures = async (req, res) => {
  const { userName, email, password, cPassowrd, gender, phone } = req.body;
  if (!(await dbService.findOne({ model: userModel, filter: { email } }))) {
    const profilePics = [];

    for (const element of req.files) {
      profilePics.push(element.path);
    }

    const user = await dbService.create({
      model: userModel,
      data: {
        userName,
        email,
        password: Hash({ plainText: password, saltRounds: 12 }),
        phone: encrypt(phone),
        gender,
        profilePic: profilePics,
        visitsCount: 0,
      },
    });
    return success.success_response({ res, status: 201, data: user });
  }
  throw new Error("email aready exist", { cause: 400 });
};

export const signUp_with_deffirent_feilds = async (req, res) => {
  const { userName, email, password, cPassowrd, gender, phone } = req.body;
  if (!(await dbService.findOne({ model: userModel, filter: { email } }))) {
    const docs = [];

    for (const element of req.files.docs) {
      docs.push(element.path);
    }

    const user = await dbService.create({
      model: userModel,
      data: {
        userName,
        email,
        password: Hash({ plainText: password, saltRounds: 12 }),
        phone: encrypt(phone),
        gender,
        profilePic: req.files.profile_pic[0].path,
        docs: docs,
        visitsCount: 0,
      },
    });
    return success.success_response({ res, status: 201, data: user });
  }
  throw new Error("email aready exist", { cause: 400 });
};

export const signUpWithGmail = async (req, res) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "746397644004-0lrjg9attdmq6bfpeo5nmcpfjij20s0m.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  const { email, name, picture, email_verified } = payload;

  let user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) {
    user = await dbService.create({
      model: userModel,
      data: {
        email,
        userName: name,
        profilePic: picture,
        confirmed: email_verified,
        visitsCount: 0,
        provider: ProviderEnum.google,
      },
    });
  }

  if (user && user.provider == ProviderEnum.system) {
    throw new Error("please logIn using the system form");
  }

  const access_token = authService.generateToken(
    //payload (data will be encrypted into the token)
    {
      payload: {
        id: user._id,
        email: user.email,
      },
      secret_key: configService.ACCESS_SECRET_KEY,

      options: {
        expiresIn: "1day",
      },
    },
  );
  success.success_response({
    res,
    message: "logged in successfully",
    data: { access_token },
  });
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  const counterKey = `user::${email}`;
  const banKey = `user::baned::${email}`;

  if (await redisService.get(banKey)) {
    const banTtl = (await redisService.ttl(banKey)) / 60;
    throw new Error(
      `you reached the max tries to logIn , try after ${Math.ceil(banTtl)} minuts`,
    );
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      confirmed: true,
    },
  });
  if (!user) {
    throw new Error(
      "email not exist you need to create an account or you need to confirm your email",
      {
        cause: 404,
      },
    );
  }
  if (!Compare({ plainText: password, cipherText: user.password })) {
    if (await redisService.get(counterKey)) {
      await redisService.incr(counterKey);
      if ((await redisService.get(counterKey)) == 5) {
        await redisService.set({
          key: banKey,
          value: true,
          ttl: 5 * 60, //5 minutes
        });
        await redisService.del(counterKey);
      }
    } else {
      await redisService.set({
        key: counterKey,
        value: 1,
      });
    }
    throw new Error("Invalid password", { cause: 400 });
  }

  await redisService.del(counterKey);

  const randomID = uuidv4(); // to generate random id for the token

  const access_token = authService.generateToken(
    //payload (data will be encrypted into the token)
    {
      payload: {
        id: user._id,
        email: user.email,
      },
      secret_key: configService.ACCESS_SECRET_KEY,
      options: {
        expiresIn: "24h", // this token will be expired after 1 hour
        // noTimestamp:true, // remove initiate time the time token generate in it
        //notBefore:60*60 ,// this token not be valid befor 1 hour
        jwtid: randomID, // make the id for the access token like the refresh token to expire theme when the user logout
      },
    },
  );
  const refresh_token = authService.generateToken({
    payload: {
      id: user._id,
      email: user.email,
    },
    secret_key: configService.REFRESH_SECRET_KEY,
    options: {
      expiresIn: "30d",
      jwtid: randomID, // make the id for the access token like the refresh token to expire theme when the user logout
    },
  });
  success.success_response({
    res,
    message: "logged in successfully",
    data: { access_token, refresh_token },
  });
};

export const refreshToken = async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("refresh token is required from the headers");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== configService.PREFIX) {
    throw new Error("invalid token prefix");
  }
  const decoded = authService.verifyToken({
    token: token,
    secret_key: configService.REFRESH_SECRET_KEY,
  });

  if (!decoded || !decoded?.id) {
    throw new Error("invalid refresh token");
  }

  const user = await dbService.findById({
    model: userModel,
    id: decoded.id,
  });

  const logOutTime = user?.changeCredetial?.getTime();
  const logInTime = decoded.iat * 1000;

  if (logOutTime > logInTime) {
    throw new Error("expired refresh token");
  }

  const access_token = authService.generateToken({
    payload: {
      id: user._id,
      email: user.email,
    },
    secret_key: configService.ACCESS_SECRET_KEY,
    options: {
      expiresIn: "15m",
      jwtid: decoded.jti, // make the id for the access token like the refresh token to expire theme when the user logout
    },
  });
  success.success_response({ res, data: { access_token } });
};

export const getMyProfile = async (req, res) => {
  const key = profile_key({ userId: req.user.id });
  const user_exist = await redisService.get(key);
  if (user_exist) {
    return success.success_response({ res, data: user_exist });
  }

  const userData = user_exist;
  if (userData.phone) {
    userData.phone = decrypt(userData.phone);
  }

  await redisService.set({
    key: key,
    value: req.user,
    ttl: 60 * 5,
  });

  return success.success_response({ res, data: userData });
};

export const getProfile = async (req, res) => {
  const { id } = req.params;

  // if the id which given from the user token == visited user id so its the same person so don't increas his id and return user data only....
  /* 
            بس  هنا مش هتنفع علشان علشان احنا مش عايزين نجبر اليوزر
        id انه يكون عامل اكونت عندي فا بالتالي ملهوش توكن ناخد منه ال 
           */

  // if(id == req.user.id){
  //     return success.success_response({
  //         res,
  //         message:"done",
  //         data:{
  //             ...req.user._doc,
  //             phone:decrypt(req.user._doc.phone)
  //         }})
  // }
  const visited_user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: id },
    update: {
      $inc: { visitsCount: 1 },
    },
  });

  if (visited_user) {
    return success.success_response({
      res,
      message: "done",
      data: {
        userName: visited_user.first_name + " " + visited_user.last_name,
        email: visited_user.email,
        visitsCount: visited_user.visitsCount,
        phone: decrypt(visited_user.phone),
      },
    });
  }
  throw new Error("no user found");
};

export const shareProfile = async (req, res) => {
  const { id } = req.params;
  const user = await dbService.findById({
    model: userModel,
    id,
    select: "-password",
  });

  if (!user) {
    throw new Error("user not exist", { cause: 401 });
  }
  user.phone = decrypt(user.phone);
  return success.success_response({ res, data: user });
};

export const updateProfile = async (req, res) => {
  let { first_name, last_name, gender, phone } = req.body;
  if (phone) {
    phone = encrypt(phone);
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { id: req.user.id },
    update: { first_name, last_name, gender, phone },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 401 });
  }
  await redisService.del(profile_key({ userId: req.user.id })); // after update remove caching to get the updated data agein from db
  return success.success_response({ res, data: user });
};

export const updatePassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;

  if (!Compare({ plainText: oldPassword, cipherText: req.user.password })) {
    throw new Error("invalid old password");
  }

  const hashedNewPassword = Hash({ plainText: newPassword });
  req.user.password = hashedNewPassword;
  await req.user.save();
  return success.success_response({ res });
};

export const logOut = async (req, res) => {
  const { flag } = req.query;

  const refreshToken = req.headers.refreshtoken;

  const [prefix, token] = refreshToken.split(" ");

  const decoded = authService.verifyToken({
    token: token,
    secret_key: configService.REFRESH_SECRET_KEY,
  });

  if (flag == "all") {
    //logout from all devices
    req.user.changeCredetial = new Date();
    await req.user.save();
    // await dbService.deleteMany({model:revokTokenModel,filter:{userId:req.user.id}}) //mogooDB
    await redisService.del(
      await redisService.keys(getUser_revokedKeys({ userId: req.user.id })),
    ); //redis
    return success.success_response({ res });
  } else {
    //logout from one device
    /* ---------- We will cache revoked tokens using Redis ---------- */
    await redisService.set({
      key: revokedToken_key({ userId: req.user.id, jti: decoded.jti }),
      value: decoded.jti,
      ttl: decoded.exp - Math.floor(Date.now() / 1000),
    });
    /* ---------- We will not use the revokeToken model because it may cause heavy load on the database ---------- */
    // await dbService.create({  // when logout called create new doc in db hold this id info
    //     model:revokTokenModel,
    //     data:{
    //         tokenId:decoded.jti,
    //         userId:req.user.id,
    //         expireAt:new Date(decoded.exp * 1000) //*1000 to convert from millisconds to seconds
    //     }
    // })
  }
  success.success_response({ res });
};
