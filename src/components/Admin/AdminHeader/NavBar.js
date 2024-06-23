import React from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import classNames from "classnames/bind";
import ProfileIcon from "./NavTabs/ProfileIcon";
import NotificationIcon from "./NavTabs/NotificationIcon";
import MenuIcon from "@mui/icons-material/Menu";
import styles from "./HeaderAdmin.scss";
import useAuth from "../../../hooks/auth-hook/auth-hook";

const cx = classNames.bind(styles);

const NavBarAdmin = ({ handleDrawerToggle }) => {
  const { user } = useAuth();
  return (
    <AppBar position="sticky" sx={{ zIndex: 2 }}>
      <Toolbar className={cx("toolbar")}>
        <Typography variant="h6" className={cx("logo")}>
          {user?.role === "ADMIN"
            ? "Quản trị"
            : user?.role === "ACADEMIC_AFFAIRS_OFFICE"
            ? "Phòng đào tạo"
            : null}
        </Typography>
        {/* <Hidden mdDown> */}
        <Box
          sx={{
            display: {
              xs: "none", // Ẩn nếu màn hình nhỏ hơn hoặc bằng md
              md: "flex", // Hiển thị nếu màn hình lớn hơn md
            },
            flexDirection: "row",
          }}
        >
          {/* <NotificationIcon /> */}
          <ProfileIcon />
        </Box>
        {/* </Hidden> */}
        {/* <Hidden mdUp> */}
        <IconButton
          sx={{
            display: {
              xs: "block", // Hiển thị nếu màn hình nhỏ hơn hoặc bằng md
              md: "none", // Ẩn nếu màn hình lớn hơn md
            },
          }}
          color={"inherit"}
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
        {/* </Hidden> */}
      </Toolbar>
    </AppBar>
  );
};

export default NavBarAdmin;
