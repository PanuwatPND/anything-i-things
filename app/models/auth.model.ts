export interface Redirect {
  redirect_url: string;
}

export interface RequestForceLogin {
  email: string;
  password: string;
}

export interface RequestLogin {
  username: string;
  password: string;
  recaptcha_token: string;
}

export interface RespLogin {
  isNeedAuth: boolean;
  token: string;
}

export interface RequestOTP {
  username: string;
  otp: string;
}

export interface OTPEmail {
  identifier: string;
  id: string;
  ref: string;
}
export interface RequestOTPGmail {
  id: string | string[];
  otp: string;
}

export interface OpenModal {
  show: boolean;
  datas: string;
}

export interface RegisterType {
  member_type: string;
  is_active: boolean;
}

export interface MemberOption {
  value: string;
  label: string;
  is_show: boolean;
}

export interface RecaptchaToken {
  recaptcha_token: string;
}

export interface FormLogin {
  username: string;
  password: string;
  recaptcha_token?: string;
}
