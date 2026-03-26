import bootstrap from "./app.controller.js";
import { sendEmail } from "./common/utils/email/send.email.js";

bootstrap();

// regex example
// const password_regx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
// const password = "Y.w_a$26666"
// console.log(".........................");

// console.log(password.match(password_regx));

// sendEmail({
//     to:"alaayassercv19@gmail.com",
//     subject:"saraha app confirmation email",
//     html:"<p> hello user <p>"
// })