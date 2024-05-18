import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ScheduleTodayPage.scss";
import Sidenav from "../../../components/Sidenav";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LoadingCard from "../../../components/LoadingCard";
import Building from "../../../components/Supervisor/Building";
import Floor from "../../../components/Supervisor/Floor";
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import { useNavigate } from "react-router-dom";
import { formatHour } from "../../../untils/format-date";
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';


const cx = classNames.bind(styles);
function ExamSchedulePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState("06/05/2024");
  const [building, setBuilding] = useState([]);
  const [buildingClick, setBuildingClick] = useState(null);
  
  const [studentsLoading, setStudentsLoading] = useState(false);
  const { getBuildings, getTimes, getRooms, getStudents } =
    useExamScheduleServices();
  
  useEffect(() => {
    const getBuildingsExam = async () => {
      if (!studentsLoading) {
        console.log(date)
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
 
    const [times, setTimes] = useState([]);
    const [time, setTime] = useState("");
    const [timeClick, setTimeClick] = useState(false);
    const [floor, setFloor] = useState([])
    const handleChange = (event) => {
      setTimeClick(true);
      setTime(event.target.value);
    };
    const [room, setRoom] = useState([]);


    useEffect(() => {
        const getTimesExam = async () => {
          if (!studentsLoading && buildingClick) {
            setStudentsLoading(true);
            try {
              const response = await getTimes(date, buildingClick._id);
              setTimes(response);
              setStudentsLoading(false);
            } catch (err) {
              setStudentsLoading(false);
              console.log("get time error: ", err);
            }
          }
        };
        getTimesExam();
      },[buildingClick])

      useEffect(() => {
        const getRoomsExam = async () => {
          if (!studentsLoading && timeClick) {
            setStudentsLoading(true);
            try {
              const response = await getRooms(time, buildingClick._id);
              const floors = [...new Set(response.map((room) => room.floor))];
              setFloor(floors);
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
      },[time])


    const handleRoomClick = (room, time) =>{
      console.log(time, room);
      navigate("attendance", { state: { time, room } });
    }

  return (
    <div className={cx("schedulePage")}>
      <div className={cx("schedulePage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("schedulePage__content")}>
        <h1>Lich thi hom nay</h1>
        {buildingClick ? 
        <div className={cx("page_content")} style={{marginTop: 20}}>
                <div className={cx("title")}>
                    <h6 className={cx("text")}>{buildingClick?.building_name}</h6>
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
                        {times.length > 0 && times.map((t) => (<MenuItem key={t} value={t}>{formatHour(t)}</MenuItem>))}
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
                            {floor.map((f) => (<Floor key={f} time={time} room={room.filter((r) => r.floor === f)} handleRoomClick={handleRoomClick}/>))}
                        </List>
                        {studentsLoading && <LoadingCard/> }
                        
                    </div>
                </div>
            </div> :
        <div className={cx("page_content")}>
          <div className={cx("title")}>
            <h6 className={cx("text")}>Danh sách tòa nhà</h6>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              {building?.length > 0 ? (
                building.map((b) => (
                  <Building key={b._id} building={b} date={date} setBuildingClick={setBuildingClick} home={true}/>
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
        </div>}
      </div>
    </div>
  );
}

export default ExamSchedulePage;
