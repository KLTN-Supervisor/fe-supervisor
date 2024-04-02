import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./AdminPage.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import NavBarAdmin from "../../components/Admin/AdminHeader/NavBar";
import SideNavAdmin from "../../components/Admin/AdminHeader/SideNav/SideNav";

const cx = classNames.bind(styles);

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.pathname || "/administrator";

  // useEffect(() => {
  //   const confirmationMessage =
  //     "If reload you will lost your session, you need to login again!";
  //   const handleBeforeUnload = (event) => {
  //     event.preventDefault();

  //     event.returnValue = confirmationMessage; // Required for Chrome
  //     return confirmationMessage;
  //   };

  //   const handleReload = (event) => {
  //     event.returnValue = confirmationMessage; // Required for Chrome

  //     if (!window.confirm(confirmationMessage)) {
  //       event.preventDefault();
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   // window.addEventListener("unload", handleReload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     // window.removeEventListener("unload", handleReload);
  //   };
  // }, []);

  useEffect(() => {
    if (from === "/administrator") navigate("./dashboard");
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <div>
      <NavBarAdmin handleDrawerToggle={handleDrawerToggle} />
      <SideNavAdmin
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        handleDrawerClose={handleDrawerClose}
      />
      <Box className={cx("wrapper")}>
        <Outlet />
      </Box>
    </div>
  );
};

export default AdminPage;
