import { storeOtp, deleteOtp } from "../otpRedis.service.js";
import { otpGenerator } from "@utils/otp.util.js";
import type { SentMessageInfo } from "nodemailer";
import transporter from "@configs/mail.config.js";
import env from "@/configs/env.config.js";
import { AppError } from "@utils/essential.util.js";

export interface OtpData {
  username: string | undefined;
  email: string | undefined;
}
export interface OtpResponse {
  messageId: string;
  accepted?: string[];
  rejected?: string[];
}

const otpService = async (data: OtpData): Promise<OtpResponse> => {
  try {
    const otp = otpGenerator();

    await storeOtp(String(data.email), otp);
    const info: SentMessageInfo = await transporter.sendMail({
      from: env.MAIL_USER,
      to: data.email,
      subject: "Verify Your Email",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:12px;
padding:40px;
box-shadow:0 6px 20px rgba(0,0,0,.08);
">

<tr>
<td align="center">

<h1
style="
margin:0;
color:#2563eb;
font-size:30px;
"
>
URL Shortner
</h1>

<p
style="
margin-top:8px;
font-size:15px;
color:#64748b;
"
>
Email Verification
</p>

</td>
</tr>

<tr>
<td style="padding-top:35px;">

<h2
style="
margin:0;
font-size:24px;
color:#0f172a;
"
>
Hello ${data.username},
</h2>

<p
style="
margin-top:18px;
font-size:16px;
line-height:1.7;
color:#475569;
"
>
Thank you for creating your account.
Use the verification code below to verify your email address.
</p>

</td>
</tr>

<tr>
<td align="center" style="padding:35px 0;">

<div
style="
display:inline-block;
padding:18px 40px;
background:#2563eb;
color:#ffffff;
font-size:34px;
font-weight:bold;
letter-spacing:12px;
border-radius:10px;
"
>
${otp}
</div>

</td>
</tr>

<tr>
<td>

<p
style="
font-size:15px;
line-height:1.7;
color:#475569;
"
>
This verification code is valid for
<strong>5 minutes</strong>.
</p>

<p
style="
font-size:15px;
line-height:1.7;
color:#475569;
"
>
If you didn't create this account, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
style="
padding-top:25px;
border-top:1px solid #e2e8f0;
text-align:center;
"
>

<p
style="
margin:0;
font-size:13px;
color:#94a3b8;
"
>
© ${new Date().getFullYear()} URL Shortner.
All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
    });
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    await deleteOtp(String(data.email));
    console.log(error);
    throw new AppError(
      "Failed to send verification email.",
      500,
      error instanceof Error ? error : undefined,
    );
  }
};

export default otpService;
