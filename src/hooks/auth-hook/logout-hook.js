import useAuth from "./auth-hook";
import useHttpClient from "../http-hook/public-http-hook";
import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useLogout = () => {
  const navigate = useNavigate();
  const { setUserLogin } = useAuth();
  const { isLoading, error, clearError, publicRequest } = useHttpClient();

  const logout = async () => {
    try {
      const response = await publicRequest("/accounts/logout");
      if (response.status === 204) {
        setUserLogin(null);
        toast.info(response.message);
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return { isLoading, error, clearError, logout };
};

export default useLogout;
