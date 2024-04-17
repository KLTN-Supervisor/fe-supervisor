import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ScheduleDetailPage.module.scss";
import Sidenav from "../../../components/Sidenav";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import StudentCard from "../../../components/Supervisor/StudentCard";
import ApartmentIcon from '@mui/icons-material/Apartment';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import Floor from "../../../components/Supervisor/Floor";
import { useLocation } from "react-router-dom";
import examScheduleServices from "../../../services/examScheduleServices";
import LoadingCard from "../../../components/LoadingCard";

const cx = classNames.bind(styles);
function ScheduleDetailPage() {
    const location = useLocation();
    const building = location.building;
    const date = location.date;
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [time, setTime] = useState([]);
    const [floor, setFloor] = useState([])
    const handleChange = (event) => {
        setTime(event.target.value);
    };
    const [room, setRoom] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const getTimes = async () => {
          if (!studentsLoading) {
            setStudentsLoading(true);
            try {
              const response = await examScheduleServices.getTimes(date, building._id);
              setTime(response);
              setStudentsLoading(false);
            } catch (err) {
              setStudentsLoading(false);
              console.log("get time error: ", err);
            }
          }
        };
        getTimes();
      },[])

      useEffect(() => {
        const getRooms = async () => {
          if (!studentsLoading) {
            setStudentsLoading(true);
            try {
              const response = await examScheduleServices.getRooms(date, building._id);
              const floors = [...new Set(response.map((room) => room.floor))];
              setFloor(floors);
              setStudents([]);
              setRoom(response);
              setStudentsLoading(false);
            } catch (err) {
              setStudentsLoading(false);
              console.log("get time error: ", err);
            }
          }
        };
        getRooms();
      },[time])


    const handleRoomClick = (Room) =>{
        const getStudents = async () => {
            if (!studentsLoading) {
              setStudentsLoading(true);
              try {
                const response = await examScheduleServices.getStudents(date, Room);
                setStudents(response);
                setRoom(response);
                setStudentsLoading(false);
              } catch (err) {
                setStudentsLoading(false);
                console.log("get time error: ", err);
              }
            }
          };
          getStudents();
    }
    return (
        <div className={cx("schedulePage")}>
        <div className={cx("schedulePage__navWraper")}>
            <Sidenav />
        </div>
        <div className={cx("schedulePage__content")}>
            <div className={cx("page_content")}>
                <div className={cx("title")}>
                    <h6 className={cx("text")}>{building.building_name}</h6>
                </div>
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
                        {time.map((t) => (<MenuItem value={t}>{t}</MenuItem>))}
                    </Select>
                    </FormControl>
                </div>
                <div className={cx("page_content__body")}>
                    <div className={cx("students")}>
                        <List
                            sx={{ width: '100%', bgcolor: 'background.paper' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                Danh sách tầng
                                </ListSubheader>
                            }
                        >
                            {floor.map((f) => (<Floor room={room.filter((r) => r.floor === f)} handleRoomClick={handleRoomClick}/>))}
                        </List>
                        {studentsLoading ? <LoadingCard/> :
                            (students?.length > 0 ? 
                                students.map((student, i) => (
                                <StudentCard key={i} student={student} />
                                )) : <div style={{width: "100%", textAlign: "center", fontWeight: 600,
                                fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                                Helvetica, Arial, sans-serif`, color: "rgb(61 60 60)"}}>Không có dữ liệu
                            </div>)
                        }
                        {!loadMore && (
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
