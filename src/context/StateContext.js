import { createContext, useReducer, useState } from "react";
import StateReducer from "./StateReducer";

const INITIAL_STATE = {
  persist: JSON.parse(localStorage.getItem("persist") || false),
  regisInfo: null,
  otpToken: null,
  user: null,
  isFetching: false,
  faceMatcher: null,
};

export const StateContext = createContext(INITIAL_STATE);

export const StateContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(StateReducer, INITIAL_STATE);
  const [auth, setAuth] = useState({});

  return (
    <StateContext.Provider
      value={{
        persist: state.persist,
        regisInfo: state.regisInfo,
        otpToken: state.otpToken,
        auth: auth,
        user: state.user,
        isFetching: state.isFetching,
        faceMatcher: state.faceMatcher,
        dispatch,
        setAuth,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
