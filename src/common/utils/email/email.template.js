export const emailTemplate = (otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OTP Verification</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, Helvetica, sans-serif;">

<table align="center" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.05);padding:40px;">

<tr>
<td align="center">

<h1 style="color:#2d6cdf;margin-bottom:10px;">
Saraha
</h1>

<p style="color:#555;font-size:16px;">
Hello,
</p>

<p style="color:#555;font-size:16px;">
Use the verification code below to complete your login.
</p>

<div style="
background:#f1f5ff;
border-radius:8px;
padding:20px;
margin:30px 0;
font-size:28px;
letter-spacing:6px;
font-weight:bold;
color:#2d6cdf;
">
Your OTP : ${otp}
</div>

<p style="color:#777;font-size:14px;">
If you didn't request this code, please ignore this email.
</p>

<hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

<p style="color:#aaa;font-size:12px;">
© 2026 Saraha App. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
};
