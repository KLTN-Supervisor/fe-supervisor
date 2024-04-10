import React from "react";
import usePrivateHttpClient from "../hooks/http-hook/private-http-hook";

const useStudentServices = () => {
  const { privateRequest } = usePrivateHttpClient();

  const getStudentsPaginated = async (page, limit, query = "") => {
    try {
      const response = await privateRequest(
        `/students?page=${page}&limit=${limit}&search=${query}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return { getStudentsPaginated };
};

export default useStudentServices;
