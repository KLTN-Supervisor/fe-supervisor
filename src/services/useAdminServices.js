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

  const trainStudentImages = async () => {
    try {
      const response = await privateRequest("/admin/students/train");

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

  const getExamFilesUploaded = async () => {
    try {
      const response = await privateRequest(`/admin/examSchedules/excel-files`);

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const importExamFromFiles = async (ids = []) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/excel-import`,
        "post",
        {
          chooseFiles: ids,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
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
      const response = await privateRequest(`/admin/accounts/ban/${id}`, "put");

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const unBanUsers = async (id) => {
    try {
      const response = await privateRequest(
        `/admin/accounts/unban/${id}`,
        "put"
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const createAccount = async (formData) => {
    try {
      const response = await privateRequest(
        "/admin/accounts/",
        "post",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const updateAccount = async (formData) => {
    try {
      const response = await privateRequest(
        "/admin/accounts/",
        "put",
        formData
      );

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

  const uploadExamSchedulesExcelFiles = async (formData, type = "students") => {
    try {
      const response = await privateRequest(
        `/admin/${type}/excels-upload`,
        "post",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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

  const updateStudent = async (id, formData) => {
    try {
      const response = await privateRequest(
        `/admin/students/${id}`,
        "put",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const createNewStudent = async (formData) => {
    try {
      const response = await privateRequest(
        "/admin/students/",
        "post",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const updateInspector = async (id, formData) => {
    try {
      const response = await privateRequest(
        `/admin/inspectors/${id}`,
        "put",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const createNewInspector = async (formData) => {
    try {
      const response = await privateRequest(
        "/admin/inspectors/",
        "post",
        formData
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const getYears = async () => {
    try {
      const response = await privateRequest(`/admin/examSchedules/getYear`);

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getTerms = async (year) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getTerm?year=${year}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getDate = async (year, term) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getDate?year=${year}&term=${term}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getBuildings = async (date) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getBuilding?date=${date}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getTimes = async (date, building_id) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getTime?date=${date}&&building_id=${building_id}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getRooms = async (date, building_id) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getRoom?date=${date}&&building_id=${building_id}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getStudents = async (date, room) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/getStudent?date=${date}&room=${room}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getReports = async (year, term, page, limit) => {
    try {
      const response = await privateRequest(
        `/admin/examSchedules/reports?year=${year}&term=${term}&page=${page}&limit=${limit}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const resetAccountPassword = async (id) => {
    try {
      const response = await privateRequest(
        `/admin/accounts/reset-password/${id}`,
        "put"
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
    createAccount,
    updateAccount,
    getUserReportsCount,
    getQuickOverview,
    getTopAuthors,
    uploadImagesImportFile,
    getAdminInspectors,
    updateStudent,
    uploadExamSchedulesExcelFiles,
    getExamFilesUploaded,
    importExamFromFiles,
    createNewStudent,
    updateInspector,
    createNewInspector,
    getYears,
    getTerms,
    getDate,
    getBuildings,
    getTimes,
    getRooms,
    getStudents,
    getReports,
    trainStudentImages,
    resetAccountPassword,
  };
};

export default useAdminServices;
