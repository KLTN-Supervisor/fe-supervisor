import { useEffect } from "react";
import useAuth from "../auth-hook/auth-hook";
import axios from "axios";
import useRefreshToken from "./refresh-token";

const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,

  withCredentials: true,
  validateStatus: (status) => {
    return status <= 500; // Resolve only if the status code is less than 500
  },
});

const useAxiosPrivate = () => {
  //const { logout } = useLogout();
  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // if (!config.headers["Authorization"]) {
        //   config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        // }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err?.response?.status === 401) {
          // Xử lý logout ở đây
          //logout(); // Gọi hàm logout từ hook useAuth để thực hiện logout
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, []);

  return axiosPrivate;
};

export default useAxiosPrivate;
