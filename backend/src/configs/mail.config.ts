import nodemailer from "nodemailer";
import env from "@configs/env.config.js";

const transporter = nodemailer.createTransport({
    host : env.SMTP_HOST,
    port : env.SMTP_PORT,
    secure : env.SMTP_SECURE,
    auth : {
        user : env.SMTP_USER,
        pass : env.SMTP_PASSWORD
    }
});

export default transporter;