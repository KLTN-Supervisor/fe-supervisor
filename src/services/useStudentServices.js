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
  const searchStudents = async (skip, search, type) => {
    try {
      const response = await privateRequest(
        `/students/search?search=${search}&type=${type}&skip=${skip}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return { getStudentsPaginated, searchStudents };
};

export default useStudentServices;
