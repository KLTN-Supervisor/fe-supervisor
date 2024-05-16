import React from "react";
import usePrivateHttpClient from "../hooks/http-hook/private-http-hook";

const useAdminServices = () => {
  const { privateRequest } = usePrivateHttpClient();
  const getQuickOverview = async () => {
    try {
      const response = await privateRequest("/admin/statistic");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getAdminPosts = async (page, limit, search = "") => {
    try {
      const response = await privateRequest(
        `/admin/post?page=${page}&limit=${limit}&search=${search}`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getAdminUsers = async (page, limit, search = "") => {
    try {
      const response = await privateRequest(
        `/admin/accounts?page=${page}&limit=${limit}&search=${search}`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getAdminStudents = async (page, limit, search = "") => {
    try {
      const response = await privateRequest(
        `/admin/students?page=${page}&limit=${limit}&search=${search}`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getAdminInspectors = async (page, limit, search = "") => {
    try {
      const response = await privateRequest(
        `/admin/inspectors?page=${page}&limit=${limit}&search=${search}`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getTopAuthors = async () => {
    try {
      const response = await privateRequest("/admin/user/mostpost");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const banUsers = async (id) => {
    try {
      const response = await privateRequest(`/admin/user/ban/${id}`, "put");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const unBanUsers = async (id) => {
    try {
      const response = await privateRequest(`/admin/user/unban/${id}`, "put");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const createUser = async (data) => {
    try {
      const response = await privateRequest(`/admin/users`, "post", data, {
        headers: { "Content-Type": "application/json" },
      });

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const uploadImportFile = async (formData, type = "students") => {
    try {
      const response = await privateRequest(
        `/admin/${type}/csv-import`,
        "post",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const uploadImagesImportFile = async (formData, type = "students") => {
    try {
      const response = await privateRequest(
        `/admin/${type}/images-import`,
        "post",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const lockPost = async (id) => {
    try {
      const response = await privateRequest(`/admin/post/lock/${id}`, "put");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const unlockPost = async (id) => {
    try {
      const response = await privateRequest(`/admin/post/unlock/${id}`, "put");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getUserReportsCount = async (userId) => {
    try {
      const response = await privateRequest(
        `/admin/users/${userId}/reports-count`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getPostReportsCount = async (postId) => {
    try {
      const response = await privateRequest(
        `/admin/posts/${postId}/reports-count`
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    getAdminUsers,
    uploadImportFile,
    getAdminStudents,
    banUsers,
    unBanUsers,
    createUser,
    getUserReportsCount,
    getQuickOverview,
    getTopAuthors,
    uploadImagesImportFile,
    getAdminInspectors,
  };
};

export default useAdminServices;
