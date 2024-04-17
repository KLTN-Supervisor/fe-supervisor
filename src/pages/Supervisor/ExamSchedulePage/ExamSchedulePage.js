import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import classNames from "classnames/bind";
import styles from "./ExamSchedulePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import StudentCard from "../../../components/Supervisor/StudentCard";
import Building from "../../../components/Supervisor/Building";
import Floor from "../../../components/Supervisor/Floor";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);
function ExamSchedulePage() {
  const [age, setAge] = useState("");
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <div className={cx("schedulePage")}>
      <div className={cx("schedulePage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("schedulePage__content")}>
        <h1>Tra cứu lịch thi</h1>
        <div className={cx("page_content")}>
          <div className={cx("page_content__header")}>
          <FormControl
              variant="standard"
              className={cx("form__select")}
              sx={{
                width: 0.9,
                border: "1px solid rgba(0, 85, 141, 0.5)",
                padding: "3px 16px",
                borderRadius: "10px",
                marginRight: 2,
              }}
            >
              <Select
                value={age}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn năm</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="standard"
              className={cx("form__select")}
              sx={{
                width: 0.9,
                border: "1px solid rgba(0, 85, 141, 0.5)",
                padding: "3px 16px",
                borderRadius: "10px",
                marginRight: 5,
              }}
            >
              <Select
                value={age}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn học kỳ</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="standard"
              className={cx("form__select")}
              sx={{
                width: 0.9,
                border: "1px solid rgba(0, 85, 141, 0.5)",
                padding: "3px 16px",
                borderRadius: "10px",
              }}
            >
              <Select
                value={age}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn ngày thi</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={cx("title")}>
            <h6 className={cx("text")}>Danh sách tòa nhà</h6>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              <Building />
              <Building />
              <Building />
              <Building />
              <Building />
              <Building />
              <Building />
              <Building />
              <Floor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamSchedulePage;
