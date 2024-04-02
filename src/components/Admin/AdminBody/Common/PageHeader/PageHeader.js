import React from "react";
import classNames from "classnames/bind";
import styles from "../../PageBody.scss";
import { Grid, Typography } from "@mui/material";

const cx = classNames.bind(styles);

const PageHeader = ({ label, pageTitle }) => {
  return (
    <Grid container>
      <Grid item xs={12} sm={12}>
        <Typography variant="body2" className={cx("page-subtitle")}>
          {label}
        </Typography>
        <Typography variant="h5" className={cx("page-title")}>
          {pageTitle}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PageHeader;
