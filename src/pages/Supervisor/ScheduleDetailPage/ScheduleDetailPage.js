import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ScheduleDetailPage.module.scss";
import Sidenav from "../../../components/Sidenav";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import StudentCard from "../../../components/Supervisor/StudentCard";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import Floor from "../../../components/Supervisor/Floor";
import { useNavigate, useLocation } from "react-router-dom";
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import LoadingCard from "../../../components/LoadingCard";
import { formatDate, formatHour } from "../../../untils/format-date";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { CircularProgress } from "@mui/material";

const cx = classNames.bind(styles);
function ScheduleDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { building, date } = location.state;
  const { getTimes, getRooms, getStudents, getRoomInfo } = useExamScheduleServices();
  const [loadMore, setLoadMore] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState("");
  const [timeClick, setTimeClick] = useState(false);
  const [floor, setFloor] = useState([]);
  const handleChange = (event) => {
    setTimeClick(true);
    setTime(event.target.value);
  };
  const [room, setRoom] = useState([]);
  const [students, setStudents] = useState([]);
  const [info, setInfo] = useState({});
  const [roomIdClicked, setRoomIdClicked] = useState("");

  useEffect(() => {
    const getTimesExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getTimes(date, building._id);
          setTimes(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get time error: ", err);
        }
      }
    };
    document.title = `Lịch thi ${building?.building_name}`;
    getTimesExam();
  }, []);

  useEffect(() => {
    const getRoomsExam = async () => {
      if (!studentsLoading && timeClick) {
        setStudentsLoading(true);
        try {
          const response = await getRooms(time, building._id);
          const floors = [...new Set(response.map((room) => room.floor))];
          setFloor(floors);
          setStudents([]);
          setRoom(response);
          setStudentsLoading(false);
          setTimeClick(false);
        } catch (err) {
          setStudentsLoading(false);
          setTimeClick(false);
          console.log("get room error: ", err);
        }
      }
    };
    getRoomsExam();
    setRoomIdClicked("");
  }, [time]);

  

  const handleRoomClick = (Room) => {
    const getStudentsExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getStudents(time, Room);
          setStudents(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get time error: ", err);
        }
      }
    };
    const getInfo = async () => {
      try {
        if (!studentsLoading) {
          const response = await getRoomInfo(time, Room);
          setInfo(response);
        }
      } catch (err) {
        console.log("get time error: ", err);
      }
    };
    if (!studentsLoading) {
      setRoomIdClicked(Room);
    }
    getInfo();
    getStudentsExam();
  };
  return (
    <div className={cx("schedulePage")}>
      <div className={cx("schedulePage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("schedulePage__content")}>
        <div className={cx("page_content")} style={{ marginTop: 20 }}>
          <div style={{display: "flex", margin: "10px 25px 20px 15px"}}>
            <div>
              <KeyboardBackspaceIcon style={{ marginRight: 20, width: 30, height: 30}} onClick={()=> navigate(-1)}/>
            </div>
            <div className={cx("title")}>
              <h6 className={cx("text")}>{building?.building_name}</h6>
            </div>
          </div>
          {/* <div className={cx("title")}>
            <h6 className={cx("text")}>{building?.building_name}</h6>
          </div> */}
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
                value={time}
                onChange={handleChange}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Chọn ca thi</em>
                </MenuItem>
                {times.length > 0 &&
                  times.map((t) => (
                    <MenuItem key={t} value={t}>
                      {formatHour(t)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              <List
                sx={{ width: "100%", bgcolor: "background.paper" }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    Danh sách tầng
                  </ListSubheader>
                }
              >
                {floor.map((f) => (
                  <Floor
                    key={f}
                    roomIdClicked={roomIdClicked}
                    room={room.filter((r) => r.floor === f)}
                    handleRoomClick={handleRoomClick}
                  />
                ))}
              </List>
              {studentsLoading ? (
                <LoadingCard />
              ) : students?.length > 0 ? (
                <>
                  <div
                    style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 20 }}
                  >
                    <span
                      style={{
                        fontFamily: "Tahoma",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#0051C6",
                      }}
                    >
                      Môn thi: {info.subject_name}, Ngày thi:{" "}
                      {formatDate(info.start_time)}, Số lượng: {info.quantity}
                    </span>
                  </div>
                  {students.map((student, i) => (
                    <StudentCard
                      key={i}
                      student={student.student}
                      attendance={student.attendance}
                    />
                  ))}
                </>
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
    </div>
  );
}

export default ScheduleDetailPage;
