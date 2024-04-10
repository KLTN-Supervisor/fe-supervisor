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
import { useNavigate } from "react-router-dom";
import useStudentServices from "../../../services/useStudentServices";

const cx = classNames.bind(styles);

function RoomingListPage() {
  const [age, setAge] = useState("");
  const [value, setValue] = useState(dayjs("2022-04-17T15:30"));
  const [modal, setModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(document.title);

  const { getStudentsPaginated } = useStudentServices();

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const toggleModal = () => {
    if (document.body.style.overflow !== "hidden") {
      document.body.style.overflow = "hidden";
      document.title = "Trang chủ";
    } else {
      document.body.style.overflow = "auto";
      document.title = currentTitle;
    }
    setModal(!modal);
  };

  const handleChange = (event) => {
    setAge(event.target.value);
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

  useEffect(() => {
    getStudents();
  }, []);

  return (
    <div className={cx("studentPage")}>
      <div className={cx("studentPage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("studentPage__content")}>
        <h1>Tra cứu sinh viên</h1>
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
                value={age}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn mục tìm kiếm</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
            <div className={cx("search")}>
              <input type="text" placeholder="Search" />
              <button
                className={cx("search__button")}
                style={{
                  display: "flex",
                  width: "auto",
                  padding: 10,
                  borderRadius: 20,
                  marginLeft: 30,
                }}
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
              {students.length > 0 &&
                students.map((student, i) => (
                  <StudentCard key={i} student={student} />
                ))}
            </div>
          </div>
        </div>
      </div>
      {modal && (
        <div className={cx("modal active-modal")}>
          <div
            onClick={toggleModal}
            className={cx("overlay")}
            style={{ alignSelf: "flex-end" }}
          >
            <CloseIcon
              className={cx("sidenav__icon")}
              style={{
                width: "27px",
                height: "27px",
                color: "white",
                margin: "12px 30px",
                position: "absolute",
                right: "0",
                cursor: "pointer",
              }}
            />
          </div>
          <div className={cx("modal-navbar-content")} style={{ width: "50%" }}>
            <div className={cx("modal-header")}>Chỉnh sửa lịch thi</div>
            <div className={cx("modal-main")}>
              <FormControl variant="standard" sx={{ m: 1, width: "80%" }}>
                <InputLabel id="demo-simple-select-standard-label">
                  Tòa nhà
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={age}
                  onChange={handleChange}
                  label="Age"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, width: "80%" }}>
                <InputLabel id="demo-simple-select-standard-label">
                  Tầng
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={age}
                  onChange={handleChange}
                  label="Age"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, width: "80%" }}>
                <InputLabel id="demo-simple-select-standard-label">
                  Phòng
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={age}
                  onChange={handleChange}
                  label="Age"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={["DateTimePicker"]}
                  sx={{ m: 1, width: "80%" }}
                >
                  <DateTimePicker
                    label="Thời gian thi"
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomingListPage;
