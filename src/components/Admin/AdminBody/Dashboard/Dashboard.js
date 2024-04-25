import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import classNames from "classnames/bind";
import styles from "../PageBody.scss";
import PageHeader from "../Common/PageHeader/PageHeader";
import { CardGraph } from "../Common/Graph/GraphComponent";
// import {
//   ArrayDataGenerator,
//   randomValueGenerator,
// } from "../../../../shared/util/ArrayDataGenerator";
import {
  // amber,
  // blue,
  green,
  // indigo,
  // lightGreen,
  red,
} from "@mui/material/colors";
// import UserOverview from "./UserOverview";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import useAdminServices from "../../../../services/useAdminServices";
import ListComponent from "./ListComponent";

const cx = classNames.bind(styles);

const DashboardBody = () => {
  const privateHttpClient = usePrivateHttpClient();
  const { getQuickOverview, getTopAuthors, getAdminUsers } = useAdminServices();

  const [displayData, setDisplayData] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getQuickOverview();

        if (data) setDisplayData(data);
      } catch (err) {
        console.error(err);
      }
    };

    const getTop5Authors = async () => {
      try {
        const data = await getTopAuthors();

        if (data) setTopAuthors(data.users);
      } catch (err) {
        console.error(err);
      }
    };

    const get5LatestUsers = async () => {
      try {
        const data = await getAdminUsers(1, 5);

        if (data) setLatestUsers(data.users);
      } catch (err) {
        console.error(err);
      }
    };

    getTop5Authors();
    get5LatestUsers();
    getData();
  }, []);

  return (
    <Box sx={{ minHeight: "110vh" }}>
      <PageHeader label="Dashboard" pageTitle="Quick Overview" />

      <Grid container spacing={1}>
        {displayData.map((item, i) => (
          <Grid key={i} item xs={6} sm={3}>
            <Card>
              <CardContent className={cx("card-content")}>
                <CardGraph
                  id={item.graphCardInfo.id}
                  data={item.graphCardInfo.data}
                  brColor={item.graphCardInfo.brColor}
                  bgColor={item.graphCardInfo.bgColor}
                  className={cx("display-card-graph")}
                />
                <Typography variant="body2" className={cx("card-label")}>
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  component="h6"
                  className={cx("card-title")}
                >
                  {item.value}
                </Typography>
                <Typography
                  component="p"
                  style={{ textAlign: "center", marginBottom: "0px" }}
                >
                  <Button
                    size="small"
                    className={cx("ratio-btn")}
                    startIcon={
                      item.iconLabel >= 0 ? (
                        <ArrowDropUpIcon />
                      ) : (
                        <ArrowDropDownIcon />
                      )
                    }
                    style={{
                      color: item.iconLabel >= 0 ? green["A700"] : red[500],
                    }}
                  >
                    {item.iconLabel >= 0 ? item.iconLabel : item.iconLabel * -1}
                    %
                  </Button>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* <UserOverview /> */}

      <ListComponent users={latestUsers} authors={topAuthors} />
    </Box>
  );
};

export default DashboardBody;
