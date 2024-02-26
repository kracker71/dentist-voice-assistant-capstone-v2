import nodemailer from "nodemailer"

const sendEmail = async (options) => {
  // 1) Create a transporter
  console.log(process.env.EMAIL_USERNAME)
  console.log(process.env.EMAIL_PASSWORD)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host:"stmp.gmail.com",
    port:586,
    secure:false,
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

export default sendEmail
