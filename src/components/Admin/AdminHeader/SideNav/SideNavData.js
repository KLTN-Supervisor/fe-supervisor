import React from "react";
import classNames from "classnames/bind";
import styles from "../HeaderAdmin.scss";
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import PortraitIcon from "@mui/icons-material/Portrait";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink } from "react-router-dom";
import useLogout from "../../../../hooks/auth-hook/logout-hook";
import useAuth from "../../../../hooks/auth-hook/auth-hook";

const cx = classNames.bind(styles);

const SideNavAdminData = ({ handleDrawerClose }) => {
  const { logout } = useLogout();
  const { user } = useAuth();
  const listItemData = [
    // {
    //   label: "Dashboard",
    //   link: "dashboard",
    //   icon: <DashboardIcon />,
    // },
    {
      label: "Báo cáo",
      link: "report",
      icon: <ReportGmailerrorredIcon />,
    },
    { label: "Lịch thi", link: "exam-schedules", icon: <ArticleIcon /> },
    {
      label: "Tài khoản",
      link: "users",
      icon: <ManageAccountsIcon />,
    },
    { label: "Sinh viên", link: "students", icon: <PortraitIcon /> },
    { label: "Thanh tra", link: "inspectors", icon: <SupervisorAccountIcon /> },
  ];

  const pdtListItemData = [
    { label: "Lịch thi", link: "exam-schedules", icon: <ArticleIcon /> },
  ];

  return (
    <List>
      {user?.role === "ADMIN"
        ? listItemData.map((item, i) => (
            <Button
              size="small"
              className={cx("nav-button")}
              onClick={handleDrawerClose}
              key={i}
            >
              <ListItem
                component={NavLink}
                to={item?.link}
                className={cx("nav-links")}
                onClick={item?.handleOnClick}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </ListItem>
            </Button>
          ))
        : pdtListItemData.map((item, i) => (
            <Button
              size="small"
              className={cx("nav-button")}
              onClick={handleDrawerClose}
              key={i}
            >
              <ListItem
                component={NavLink}
                to={item?.link}
                className={cx("nav-links")}
                onClick={item?.handleOnClick}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </ListItem>
            </Button>
          ))}
    </List>
  );
};

export default SideNavAdminData;
