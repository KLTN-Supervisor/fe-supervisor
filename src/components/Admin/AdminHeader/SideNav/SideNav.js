import React, { useState } from "react";
import { Box, Drawer, Typography } from "@mui/material";
import classNames from "classnames/bind";
import styles from "../HeaderAdmin.scss";
import SideNavAdminData from "./SideNavData";

const cx = classNames.bind(styles);

const SideNavAdmin = ({
  mobileOpen,
  handleDrawerToggle,
  handleDrawerClose,
}) => {
  return (
    <Box
      component="nav"
      sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            marginTop: 8.125,
          },
        }}
      >
        <SideNavAdminData handleDrawerClose={handleDrawerClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            marginTop: 8.125,
          },
        }}
        open
      >
        <SideNavAdminData handleDrawerClose={handleDrawerClose} />
      </Drawer>
    </Box>
  );
};

export default SideNavAdmin;
