import useAuth from "./auth-hook";
import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePrivateHttpClient from "../http-hook/private-http-hook";

const useLogout = () => {
  const navigate = useNavigate();
  const { setUserLogin } = useAuth();
  const { isLoading, error, clearError, privateRequest } =
    usePrivateHttpClient();

  const logout = async () => {
    try {
      const response = await privateRequest("/accounts/logout");
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
