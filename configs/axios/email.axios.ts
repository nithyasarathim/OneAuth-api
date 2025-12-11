import axios from "axios";
import config from "../env";

const AUTH_MAIL_URL = config.emailServerUrl;

const emailAPI = axios.create({
  baseURL: AUTH_MAIL_URL,
  timeout: 10000,
});

const sendVerificationEmail = function async(
  email: string,
  otp: string,
  timestamp: number,
  signature: string
) {
  return emailAPI.post("/auth/send-email", {
    email: email,
    otp: otp,
    timestamp: timestamp,
    signature: signature,
  });
};

export { sendVerificationEmail };
