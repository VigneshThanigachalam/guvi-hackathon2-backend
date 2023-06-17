import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";
export const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.EMAIL_PASSWORD, // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    html: data.html, // html body
  });
});