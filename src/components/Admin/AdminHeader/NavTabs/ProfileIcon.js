import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "../HeaderAdmin.scss";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import useLogout from "../../../../hooks/auth-hook/logout-hook";
import useAuth from "../../../../hooks/auth-hook/auth-hook";
import { getStudentsImageSource } from "../../../../untils/getImageSource";

const cx = classNames.bind(styles);

const ProfileIcon = () => {
  const { logout } = useLogout();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dropDownData = [
    // { label: "Settings", icon: <SettingsIcon /> },
    { label: "Logout", icon: <LogoutIcon />, func: logout },
  ];

  return (
    <Box>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        startIcon={
          <Avatar
            src={getStudentsImageSource(user.avatar)}
            className={cx("navAvatar")}
          ></Avatar>
        }
      ></Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {dropDownData.map((item, i) => (
          <MenuItem key={i} component={ListItem} onClick={item.func}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ProfileIcon;
