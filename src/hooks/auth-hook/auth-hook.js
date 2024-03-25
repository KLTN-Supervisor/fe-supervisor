import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import {
  LoginFailure,
  setUser,
  setPersist,
  setRegisInfo,
  setOtpToken,
} from "../../context/StateAction";

const useAuth = () => {
  const { auth, regisInfo, otpToken, user, persist, dispatch, setAuth } =
    useContext(StateContext);

  const setRegisterInfo = (regisInfo) => {
    if (regisInfo) dispatch(setRegisInfo(regisInfo));
  };

  const setOtp = (otpToken) => {
    if (otpToken) dispatch(setOtpToken(otpToken));
  };

  const setUserLogin = (user) => {
    if (user) dispatch(setUser(user));
    else dispatch(LoginFailure());
  };

  const setPersistLogin = (persist = true) => {
    dispatch(setPersist(persist));
  };

  return {
    auth,
    regisInfo,
    otpToken,
    user,
    persist,
    setAuth,
    setOtp,
    setUserLogin,
    setRegisterInfo,
    setPersistLogin,
  };
};

export default useAuth;
