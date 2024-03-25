import { useState, useCallback, useRef, useEffect } from "react";
import useAxiosPrivate from "./private-axios-hook";

const useMultiplePrivateHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const axiosPrivate = useAxiosPrivate();

  const activePrivateRequests = useRef([]);

  const makePromise = useCallback(
    async (url, signal, method = "get", body = null, options = {}) => {
      try {
        const response = await axiosPrivate({
          method,
          url,
          data: body,
          options,
          signal: signal,
        });

        if (response.status >= 400) {
          throw new Error(response.data.message);
        }

        return response;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const multiplePrivateRequests = useCallback(async (requests) => {
    setIsLoading(true);
    const httpAbortCtrl = new AbortController();
    activePrivateRequests.current.push(httpAbortCtrl);

    try {
      const promises = requests.map((request) =>
        makePromise({
          ...request,
          signal: activePrivateRequests.current.signal,
        })
      );
      const responses = await Promise.all(promises);

      setIsLoading(false);
      return responses;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activePrivateRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return {
    isLoading,
    error,
    clearError,
    multiplePrivateRequests,
  };
};

export default useMultiplePrivateHttpClient;
