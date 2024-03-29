import env from "../config/config.js"
export const verificationContent = (id) => {
  return (
    "<div> <h3>Click the button below to activate your email address </h3>" +
    `<a href='${env.NODE_ENV === "production" ? "https" : "http"}://${env.FRONTEND_IP}:${env.FRONTEND_PORT}/register/verification/${id}'>` +
    "<button style='background:green; color:white; height:36px; width:180px; border:2px solid rgba(0, 0, 0, 0.05);'> Verify My Email </button> </a> </div>"
  );
};
