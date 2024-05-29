import { useCallback } from "react";
import useAuth from "../auth-hook/auth-hook";
import useHttpClient from "./public-http-hook";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const { publicRequest } = useHttpClient();

  const refresh = async () => {
    const response = await publicRequest("/accounts/refresh");

    setAuth((prev) => {
      return {
        ...prev,
        accessToken: response.data.access_token,
      };
    });

    return response.data.access_token;
  };
  return refresh;
};

export default useRefreshToken;
