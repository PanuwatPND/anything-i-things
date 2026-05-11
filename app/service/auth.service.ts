import type {
  RecaptchaToken,
  RequestLogin,
  RequestOTP,
  RequestOTPGmail,
} from "~/models/auth.model";
import { client } from "./httpClient";

export const login = (payload: RequestLogin) => {
  return client({
    url: "/manage/auth/login",
    method: "POST",

    data: payload,
  });
};

export const getInfo = () => {
  return client({
    url: "/user-manage/info",
    method: "GET",
  });
};
