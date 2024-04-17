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
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);
function ExamSchedulePage() {
  const [building, setBuilding] = useState([]);
  const [year, setYear] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  const [term, setTerm] = useState([]);
  const handleTermChange = (event) => {
    setTerm(event.target.value);
  };
  const [date, setDate] = useState([]);
  const handleDateChange = (event) => {
    setDate(event.target.value);
  };
  useEffect(() => {
    const getYears = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await useExamScheduleServices.getYears();
          setYear(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getYears();
  },[])

  useEffect(() => {
    const getTerms = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await useExamScheduleServices.getTerms(year);
          setTerm(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getTerms();
  },[year])

  useEffect(() => {
    const getDates = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await useExamScheduleServices.getDates(year, term);
          
          // Tạo một Set để lưu trữ các ngày không trùng nhau
          const uniqueDatesSet = new Set();
          
          // Lặp qua mảng datetime và lấy ngày từ mỗi mục
          response.forEach((datetime) => {
            const date = datetime.toISOString().split('T')[0];
            uniqueDatesSet.add(date);
          });
          
          // Chuyển Set thành mảng
          const uniqueDatesArray = Array.from(uniqueDatesSet);
          setDate(uniqueDatesArray);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getDates();
  },[term])

  useEffect(() => {
    const getBuildings = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await useExamScheduleServices.getBuildings(date);
          setBuilding(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getBuildings();
  },[date])

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
                value={year}
                onChange={handleYearChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn năm</em>
                </MenuItem>
                {year.map((y) => (<MenuItem value={y}>{y} - {y+1}</MenuItem>))}
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
                value={term}
                onChange={handleTermChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn học kỳ</em>
                </MenuItem>
                {term.map((t) => (<MenuItem value={t}>Học kỳ {t}</MenuItem>))}
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
                value={date}
                onChange={handleDateChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn ngày thi</em>
                </MenuItem>
                {date.map((t) => (<MenuItem value={t}>{t}</MenuItem>))}
              </Select>
            </FormControl>
          </div>
          <div className={cx("title")}>
            <h6 className={cx("text")}>Danh sách tòa nhà</h6>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              {building.map((b) => (
                <Building key={b._id} building={b} date={date} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamSchedulePage;
