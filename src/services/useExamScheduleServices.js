import usePrivateHttpClient from "../hooks/http-hook/private-http-hook";

const useExamScheduleServices = () => {
  const { privateRequest } = usePrivateHttpClient();

  const getYears = async () => {
    try {
      const response = await privateRequest(`/examSchedule/getYear`);

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getTerms = async (year) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getTerm?year=${year}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getDate = async (year, term) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getDate?year=${year}&&term=${term}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getBuildings = async (date) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getBuilding?date=${date}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getTimes = async (date, building_id) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getTime?date=${date}&&building_id=${building_id}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getRooms = async (date, building_id) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getRoom?date=${date}&&building_id=${building_id}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getStudents = async (date, room) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getStudent?date=${date}&room=${room}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getSuspiciousStudents = async (date) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getSuspicious?date=${date}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const attendanceStudent = async (date, room, studentId, attendance) => {
    try {
      const response = await privateRequest(
        `/examSchedule/attendance?date=${date}&room=${room}&studentId=${studentId}&attendance=${attendance}`,
        "put"
      );

      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  const noteReport = async (date, room, formData) => {
    try {
      const response = await privateRequest(
        `/examSchedule/report?date=${date}&room=${room}`,
        "post",
        formData
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getExamReport = async (date, room) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getExamReports?date=${date}&room=${room}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteExamReport = async (reportId) => {
    try {
      const response = await privateRequest(
        `/examSchedule/deleteReport?reportId=${reportId}`,
        "put"
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getRoomInfo = async (date, room) => {
    try {
      const response = await privateRequest(
        `/examSchedule/getInfo?date=${date}&room=${room}`
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    getYears,
    getTerms,
    getDate,
    getBuildings,
    getTimes,
    getRooms,
    getStudents,
    getSuspiciousStudents,
    attendanceStudent,
    noteReport,
    getExamReport,
    deleteExamReport,
    getRoomInfo,
  };
};

export default useExamScheduleServices;
