import * as nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  var transport =
    process.env.NODE_ENV === "production"
      ? nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD,
          },
        })
      : nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

  const mailOptions = {
    from: "Ziyad Barnawi <ziad0br@outlook.com>",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions);
};
