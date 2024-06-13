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
import { formatDate } from "../../../untils/format-date";

const cx = classNames.bind(styles);
function ExamSchedulePage() {
  const [building, setBuilding] = useState([]);
  const [year, setYear] = useState("");
  const [years, setYears] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const { getYears, getTerms, getDate, getBuildings } =
    useExamScheduleServices();
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState("");
  const handleTermChange = (event) => {
    setTerm(event.target.value);
  };
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState("");
  const handleDateChange = (event) => {
    setDate(event.target.value);
  };
  useEffect(() => {
    const getYearExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getYears();
          console.log(response);
          setYears(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    document.title = `Tra cứu phòng thi`;
    getYearExam();
  }, []);

  useEffect(() => {
    const getTermsExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getTerms(year);
          setTerms(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get terms error: ", err);
        }
      }
    };
    getTermsExam();
  }, [year]);

  useEffect(() => {
    const getDatesExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getDate(year, term);
          console.log(response);

          // Tạo một Set để lưu trữ các ngày không trùng nhau
          const uniqueDatesSet = new Set();

          // Lặp qua mảng datetime và lấy ngày từ mỗi mục
          response.forEach((datetime) => {
            const date = new Date(datetime).toISOString().split("T")[0];
            const dateFormat = formatDate(date);
            uniqueDatesSet.add(dateFormat);
          });

          // Chuyển Set thành mảng
          const uniqueDatesArray = Array.from(uniqueDatesSet);
          setDates(uniqueDatesArray);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get date error: ", err);
        }
      }
    };
    getDatesExam();
  }, [term]);

  useEffect(() => {
    const getBuildingsExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getBuildings(date);
          setBuilding(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getBuildingsExam();
  }, [date]);

  return (
    <div className={cx("schedulePage")}>
      <div className={cx("schedulePage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("schedulePage__content")}>
        <h1 style={{fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`, fontWeight: 500, padding:"0px 20px 0px 20px"}}>TRA CỨU PHÒNG THI</h1>
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
                {years?.length > 0 &&
                  years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y} - {y + 1}
                    </MenuItem>
                  ))}
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
                {terms?.length > 0 &&
                  terms.map((t) => (
                    <MenuItem key={t} value={t}>
                      Học kỳ {t}
                    </MenuItem>
                  ))}
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
                {dates?.length > 0 &&
                  dates.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
          <div className={cx("title")}>
            <h6 className={cx("text")}>Danh sách tòa nhà</h6>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              {building?.length > 0 ? (
                building.map((b) => (
                  <Building key={b._id} building={b} date={date} />
                ))
              ) : (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontWeight: 600,
                    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Helvetica, Arial, sans-serif`,
                    color: "rgb(61 60 60)",
                  }}
                >
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamSchedulePage;
