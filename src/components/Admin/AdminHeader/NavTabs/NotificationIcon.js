import React, { useState } from "react";
import styles from "../HeaderAdmin.scss";
import classNames from "classnames/bind";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const cx = classNames.bind(styles);

const NotificationIcon = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dropDownData = [
    { label: "Danh", desc: "thích bài viết" },
    { label: "Dương", desc: "thích bài viết" },
    { label: "Đa", desc: "thích bài viết" },
    { label: "Hùng", desc: "thích bài viết" },
  ];

  return (
    <Box>
      <IconButton
        aria-controls={open ? "Notifications" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        color="inherit"
      >
        <Badge badgeContent={3} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <List className={cx("navlist")}>
          {dropDownData.map((item, i) => (
            <MenuItem key={i} onClick={handleClose}>
              <ListItemIcon>
                <Avatar className={cx("ulAvatar")}>
                  {item.label[0].toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </List>
      </Menu>
    </Box>
  );
};

export default NotificationIcon;
