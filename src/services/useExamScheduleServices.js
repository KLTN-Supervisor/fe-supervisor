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

  return {
    getYears,
    getTerms,
    getDate,
    getBuildings,
    getTimes,
    getRooms,
    getStudents,
    getSuspiciousStudents
  };
};

export default useExamScheduleServices;
