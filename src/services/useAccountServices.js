import usePrivateHttpClient from "../hooks/http-hook/private-http-hook";
import usePulicHttpClient from "../hooks/http-hook/public-http-hook";

const useAccountServices = () => {
  const { publicRequest } = usePulicHttpClient();
  const { privateRequest } = usePrivateHttpClient();

  const login = async (username, password) => {
    try {
      const response = await privateRequest(
        "/accounts/login",
        "post",
        { username: username, password: password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getLoginAccount = async () => {
    try {
      const response = await privateRequest("/accounts/");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  return { login, getLoginAccount };
};

export default useAccountServices;
