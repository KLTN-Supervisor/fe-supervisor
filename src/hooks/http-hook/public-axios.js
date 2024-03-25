import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,

  withCredentials: true,
  validateStatus: (status) => {
    return status < 500; // Resolve only if the status code is less than 500
  },
});
