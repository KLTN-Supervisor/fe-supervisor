import { useCallback } from "react";
import useAuth from "../auth-hook/auth-hook";
import useHttpClient from "./public-http-hook";
import { axiosPublic } from "./public-axios";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const { publicRequest } = useHttpClient();

  const refresh = async () => {
    const response = await publicRequest("/auth/refresh");

    setAuth((prev) => {
      return {
        ...prev,
        accessToken: response.data.accessToken,
      };
    });

    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
