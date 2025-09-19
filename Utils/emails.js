import * as nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Ziyad Barnawi <Ziyad0barnawi@outlook.com>",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions); //TODO: test this mailing service.
};
