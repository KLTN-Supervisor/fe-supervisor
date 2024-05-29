import React from "react";
import classNames from "classnames/bind";
import { CircularProgress } from "@mui/material";

const WelcomPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress size={60} />
    </div>
  );
};

export default WelcomPage;
