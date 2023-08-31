const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log(options);

  // 2) Define the email options
  const mailOptions = {
    from: "noreply.host.dentist@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
    attachments: options.attachments,
    html: options.html,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
