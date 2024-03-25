import useAuth from "./auth-hook";
import useHttpClient from "../http-hook/public-http-hook";
import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import { setAuth, setPosts } from "../../context/StateAction";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();
  const { setUserLogin, setPersistLogin } = useAuth();
  const { dispatch } = useContext(StateContext);
  const { isLoading, error, clearError, publicRequest } = useHttpClient();

  const logout = async () => {
    setAuth(null);
    setUserLogin(null);
    setPersistLogin(false);
    dispatch(setPosts([]));
    try {
      const response = await publicRequest("/auth/logout");
      if (response?.data?.message || response.status === 204) {
        console.log(response?.data?.message);
        navigate("/accounts/login");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return { isLoading, error, clearError, logout };
};

export default useLogout;
