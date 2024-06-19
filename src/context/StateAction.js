export const LoginStart = (userCredentials) => ({
  type: "LOGIN_START",
});

export const LoginSuccess = (user) => ({
  type: "LOGIN_SUCCESS",
  payload: user,
});

export const LoginFailure = () => ({
  type: "LOGIN_FAILURE",
});

export const setUser = (user) => ({
  type: "SET_USER",
  payload: user,
});
export const setAuth = (accessToken) => ({
  type: "SET_AUTH",
  payload: accessToken,
});
export const setPersist = (persist = true) => ({
  type: "SET_PERSIST",
  payload: persist,
});
export const setRegisInfo = (regisInfo) => ({
  type: "SET_REGIS_INFO",
  payload: regisInfo,
});
export const setOtpToken = (otpToken) => ({
  type: "SET_OTP_TOKEN",
  payload: otpToken,
});
export const setFaceMatcher = (faceMatcher) => ({
  type: "SET_FACE_MATCHER",
  payload: faceMatcher,
});
