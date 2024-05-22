import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./StudentSearchingPage.module.scss";
import Sidenav from "../../../components/Sidenav";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import StudentCard from "../../../components/Supervisor/StudentCard";
import LoadingCard from "../../../components/LoadingCard";
import { useNavigate } from "react-router-dom";
import useStudentServices from "../../../services/useStudentServices";
import { Alert, Snackbar, CircularProgress } from "@mui/material";

const cx = classNames.bind(styles);

function RoomingListPage() {
  const [typeSearch, setTypeSearch] = useState("");
  const searchRef = useRef();
  const scrollRef = useRef();
  const [loadMore, setLoadMore] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarNotif, setSnackBarNotif] = useState({
    severity: "success",
    message: "This is success message!",
  }); //severity: success, error, info, warning

  const [value, setValue] = useState(dayjs("2022-04-17T15:30"));
  const [currentTitle, setCurrentTitle] = useState(document.title);

  const { getStudentsPaginated, searchStudents } = useStudentServices();

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [page, setPage] = useState(1);

  

  const handleChange = (event) => {
    setTypeSearch(event.target.value);
  };

  const getStudents = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getStudentsPaginated(page, 20);

        setStudents(response.students);
        setStudentsLoading(false);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get students error: ", err);
      }
    }
  };

  const handleSearch = async () => {
    if (!studentsLoading && searchRef.current.value != "") {
      setStudentsLoading(true);
      try {
        if (typeSearch == "") {
          setSnackBarNotif({
            severity: "error",
            message: "Vui lòng chọn mục tìm kiếm",
          });
          setSnackBarOpen(true);
        } else {
          const response = await searchStudents(
            0,
            searchRef.current.value,
            typeSearch
          );
          setStudents(response);
          console.log(response);
        }
      } catch (err) {
        console.log("get students error: ", err);
      } finally {
        setStudentsLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleScroll = async () => {
      const scrollTop = scrollRef.current.scrollTop;
      const scrollHeight = scrollRef.current.scrollHeight;
      if (scrollTop === scrollHeight) {
        console.log("Đã đạt đến cuoi trang" + students?.length);
        try {
          setLoadMore(true);
          const data = await searchStudents(
            students?.length,
            searchRef.current.value,
            typeSearch
          );
          setStudents((prev) => [...prev, data]);
        } catch (error) {
          console.log("Lỗi:", error);
        } finally {
          setLoadMore(false);
        }
      }
    };

    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [students]);

  useEffect(() => {
    getStudents();
  }, []);

  return (
    <div className={cx("studentPage")}>
      <div className={cx("studentPage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("studentPage__content")} ref={scrollRef}>
        <h1
          style={{
            fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  Helvetica, Arial, sans-serif`,
          }}
        >
          Tra cứu sinh viên
        </h1>
        <div className={cx("page_content")}>
          <div className={cx("page_content__header")}>
            <FormControl
              variant="standard"
              className={cx("form__select")}
              sx={{
                width: 0.2,
                marginRight: "20px",
                border: "1px solid rgba(0, 85, 141, 0.5)",
                padding: "3px 16px",
                borderRadius: "10px",
              }}
            >
              <Select
                value={typeSearch}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn mục tìm kiếm</em>
                </MenuItem>
                <MenuItem value="name">Họ tên</MenuItem>
                <MenuItem value="id">MSSV</MenuItem>
              </Select>
            </FormControl>
            <div className={cx("search")}>
              <input type="text" placeholder="Search" ref={searchRef} />
              <button
                className={cx("search__button")}
                style={{
                  display: "flex",
                  width: "auto",
                  padding: 10,
                  borderRadius: 20,
                  marginLeft: 30,
                }}
                onClick={handleSearch}
              >
                <SearchIcon
                  className={cx("search__icon")}
                  style={{ width: "24px", height: "24px", fontWeight: "900" }}
                />
                <span className={cx("span")}>Search</span>
              </button>
            </div>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              {studentsLoading ? (
                <LoadingCard />
              ) : students?.length > 0 ? (
                students.map((student, i) => (
                  <StudentCard key={i} student={student} />
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
                  Không tìm thấy kết quả
                </div>
              )}
              {loadMore && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={30} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={(event, reason) => {
          setSnackBarOpen(false);
        }}
      >
        <Alert
          onClose={(event, reason) => {
            setSnackBarOpen(false);
          }}
          severity={snackBarNotif.severity}
          sx={{ width: "100%" }}
        >
          {snackBarNotif.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default RoomingListPage;
