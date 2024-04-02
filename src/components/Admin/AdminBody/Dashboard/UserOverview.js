import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";
import classNames from "classnames/bind";
import styles from "../PageBody.scss";
import { GeneralGraph } from "../Common/Graph/GraphComponent";
import { ArrayDataGenerator } from "../../../../shared/util/ArrayDataGenerator";
import { blue, red } from "@mui/material/colors";

const cx = classNames.bind(styles);

const UserOverview = () => {
  const lineGraphData = {
    id: "userLineGraph",
    type: "line",
    datasets: [
      {
        label: "Hiện tại",
        data: ArrayDataGenerator({ count: 30, digit: 100 }),
        backgroundColor: "rgba(21,101,192,0.6)",
        borderColor: blue["A200"],
        fill: true,
        tension: 0.5,
      },
      {
        label: "Tháng trước",
        data: ArrayDataGenerator({ count: 30, digit: 100 }),
        backgroundColor: "rgba(198,40,40,0.6)",
        borderColor: red["A200"],
        fill: true,
        tension: 0.5,
      },
    ],
    xAxisLabels: ["week1", "week2", "week3", "week4", "week5"],
  };

  const pieGraphData = {
    id: "userPieGraph",
    type: "pie",
    datasets: [
      {
        label: "Hiện tại",
        data: ArrayDataGenerator({ count: 3, digit: 1000 }),
        backgroundColor: [blue[100], blue[200], blue[300]],
        borderColor: blue["A200"],
        fill: true,
        tension: 0.5,
      },
    ],
    xAxisLabels: ["Destop", "Tablet", "Mobile"],
  };

  return (
    <Box className={cx("section")}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h6">
                Tổng quan người dùng
              </Typography>
            </CardContent>
            <CardContent>
              <GeneralGraph
                id={lineGraphData.id}
                type={lineGraphData.type}
                datasets={lineGraphData.datasets}
                xAxisLabels={lineGraphData.xAxisLabels}
                className={cx("display-user-graph")}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h6">
                Thiết bị sử dụng
              </Typography>
            </CardContent>
            <CardContent>
              <GeneralGraph
                id={pieGraphData.id}
                type={pieGraphData.type}
                datasets={pieGraphData.datasets}
                xAxisLabels={pieGraphData.xAxisLabels}
                className={cx("display-user-graph")}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserOverview;
