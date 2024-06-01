import React, { useRef, useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useLocation } from "react-router-dom";
import LoadingCard from "../../../components/LoadingCard";
import StudentCard from "../../../components/Supervisor/StudentCard";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import ro from "date-fns/esm/locale/ro/index.js";

const cx = classNames.bind(styles);

function HomePage() {
  const location = useLocation();
  const { getStudents, attendanceStudent, noteReport, getExamReport, deleteExamReport } =
    useExamScheduleServices();
  // Lưu giá trị vào localStorage khi trang được tải
  useEffect(() => {
    if (location.state) {
      localStorage.setItem("time", location.state.time);
      localStorage.setItem("room", location.state.room);
      localStorage.setItem("roomName", location.state.roomName);
    }
  }, [location.state]);

  // Đọc giá trị từ localStorage khi trang được tải lại
  const { time, room, roomName } = location.state ?? {
    time: localStorage.getItem("time") || "",
    room: localStorage.getItem("room") || "",
    roomName: localStorage.getItem("roomName") || "",
  };

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarNotif, setSnackBarNotif] = useState({
    severity: "success",
    message: "This is success message!",
  }); //severity: success, error, info, warning

  const getStudentsExam = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getStudents(time, room);
        setStudents(response);
        setStudentsLoading(false);
        setIsFetched(true);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get time error: ", err);
      }
    }
  };

  
  useEffect(() => {
    getStudentsExam();
    getReportsExam()
  }, [time, room]);
  useEffect(() => {
    console.log(students);
    // loadModels();
  }, [isFetched]);

  const fileInputRef = useRef(null);
  //Kéo thả ảnh vào phần tạo bài viết

  //Validate file
  const notValidFile = (file) => {
    //image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm
    return (
      file.type !== "image/jpg" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/webp" &&
      file.type !== "video/mp4" &&
      file.type !== "video/webm"
    );
  };

  function selectFiles() {
    fileInputRef.current.click();
  }

  //reports
  const [modal, setModal] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(document.title);

  const [reportType, setReportType] = useState("");
  const handleChange = (event) => {
    setReportType(event.target.value);
  };
  const [note, setNote] = useState("");
  const [imageModals, setImageModals] = useState([]);

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

  const toggleModalCreate = () => {
    if (document.body.style.overflow !== "hidden") {
      document.body.style.overflow = "hidden";
      document.title = "Trang chủ";
    } else {
      document.body.style.overflow = "auto";
      document.title = currentTitle;
    }
    setNote("");
    setReportType("");
    setImageModals([]);
    setModalCreate(!modalCreate);
  };

  function onFileModalSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      if (notValidFile(files[i])) continue;
      if (!imageModals.some((e) => e.name === files[i].name)) {
        setImageModals((prevImages) => [
          ...prevImages,
          {
            name: files[i].name,
            url: URL.createObjectURL(files[i]),
            file: files[i],
          },
        ]);
      }
    }
  }

  function deleteImage(index) {
    setImageModals((prevImages) => prevImages.filter((_, i) => i !== index));
  }

  const [report, setReport] = useState([]);
  const [creatingReport, setCreatingReport] = useState(false);

  const getReportsExam = async () => {
    try {
      const response = await getExamReport(time, room);
      setReport(response);
    } catch (err) {
      console.log("get time error: ", err);
    }
  };

  const handleCreateReport = async () => {
    try {
      setCreatingReport(true);
      if (reportType == "") {
        setSnackBarNotif({
          severity: "error",
          message: "Vui lòng chọn loại biên bản",
        });
        setSnackBarOpen(true);
      } else if(imageModals.length == 0){
        setSnackBarNotif({
          severity: "error",
          message: reportType == "REPORT" ? "Vui lòng cung cấp ảnh cho biên bản" : "Vui lòng cung cấp ảnh cho sự cố",
        });
        setSnackBarOpen(true);
      } else {
        const formData = new FormData();
        formData.append("note", note);
        formData.append("reportType", reportType);

        imageModals.map((imageModal, i) => {
          formData.append("image", imageModal.file);
        });

        const response = await noteReport(time, room, formData);
        if (response) {
          const newReport = {
            _id: response.new_report._id,
            report_type: reportType,
            note: note,
            images: imageModals,
            date: time,
            room: room,
          };
          console.log(newReport)
          setReport((prev) => [...prev, newReport]);
          toggleModalCreate();
        }
      }
    } catch (err) {
      toggleModalCreate();
      console.log("get students error: ", err);
    } finally {
      setCreatingReport(false);
    }
  };

  const deleteReport = async (index, r) => {
    try {
      const response = await deleteExamReport(r._id);
      if(response){
        setReport((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.log("get time error: ", err);
    }
    
  }

  const updateAttendance = async (studentId) => {
    const updatedStudents = await Promise.all(
      students.map(async (student) => {
        if (student.student.student_id === studentId) {
          await attendanceStudent(time, room, studentId, !student.attendance);
          return { ...student, attendance: !student.attendance };
        }
        return student;
      })
    );

    setStudents(updatedStudents);
  };

  const updateAttendanceTrue = async (studentId) => {
    const updatedStudents = await Promise.all(
      students.map(async (student) => {
        if (student.student.student_id === studentId) {
          await attendanceStudent(time, room, studentId, true);
          return { ...student, attendance: true };
        }
        return student;
      })
    );

    setStudents(updatedStudents);
  };

  return (
    <div className={cx("homepage")}>
      <div className={cx("homepage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("homepage__timeline")}>
        <div className={cx("page_content")} style={{ marginTop: 20 }}>
          <div
            onClick={toggleModal}
            style={{
              position: "absolute",
              right: "5%",
              top: "40px",
              display: "inline-block",
              backgroundColor: "#0095f6",
              padding: "10px",
              color: "white",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Báo cáo {report.length > 0 && `(${report.length})`}
          </div>
          <div className={cx("title")}>
            <h6 className={cx("text")}>{roomName}</h6>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")}>
              {studentsLoading ? (
                <LoadingCard />
              ) : students?.length > 0 ? (
                students.map((student, i) => (
                  <StudentCard
                    key={i}
                    student={student.student}
                    attendance={student.attendance}
                    home={true}
                    updateAttendance={() =>
                      updateAttendance(student.student.student_id)
                    }
                    updateAttendanceTrue={() =>
                      updateAttendanceTrue(student.student.student_id)
                    }
                  />
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
            <div className={cx("modal-header")}>
              Biên bản báo cáo
              <div
                onClick={toggleModalCreate}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "5px",
                  display: "inline-block",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <AddCircleOutlineOutlinedIcon
                  style={{ width: 30, height: 30 }}
                />
              </div>
            </div>
            <div className={cx("modal-main")}>
              <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
                <nav aria-label="main mailbox folders">
                  <List>
                    {report.length > 0 ? (
                      report.map((r, index) => (
                        <ListItem
                          key={r._id}
                          disablePadding
                          secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteReport(index, r)} >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemButton>
                            <ListItemIcon sx={{ minWidth: '40px' }}>
                             {r.report_type !== "REPORT" ? <WarningAmberRoundedIcon /> : <AssignmentOutlinedIcon/>}
                            </ListItemIcon>
                            <ListItemText primary={(r.report_type === "REPORT" ? "Biên bản: " : "Sự cố: ") + r.note} primaryTypographyProps={{
                              style: {
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              },
                            }}/>
                          </ListItemButton>
                        </ListItem>
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
                        Không có báo cáo
                      </div>
                    )}
                  </List>
                </nav>
              </Box>
            </div>
          </div>
        </div>
      )}

      {modalCreate && (
        <div className={cx("modal active-modal")}>
          <div
            onClick={toggleModalCreate}
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
          <div className={cx("modal-navbar-content")} style={{ width: "80%" }}>
            <div className={cx("modal-header")}>Tạo báo cáo</div>
            <div className={cx("modal-main")}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div className={cx("modal-main-title")}>Loại biên bản:</div>
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
                    value={reportType}
                    onChange={handleChange}
                    displayEmpty
                    disableUnderline
                    inputProps={{ "aria-label": "Without label" }}
                    sx={{ height: "100%" }}
                  >
                    <MenuItem value="">
                      <em>Chọn loại báo cáo</em>
                    </MenuItem>
                    <MenuItem value="REPORT">Biên bản</MenuItem>
                    <MenuItem value="PROBLEM">Sự cố</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div className={cx("modal-main-title")}>Ghi chú:</div>
                <textarea
                  className={cx("modal-main-input")}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                  }}
                  placeholder="Ghi chú..."
                ></textarea>
              </div>
              <div className={cx("modal-input")}>
                <div
                  className={cx("modal-main-title")}
                  style={{ width: "auto", margin: "4%" }}
                >
                  Hình ảnh:
                </div>
                <input
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                  multiple
                  ref={fileInputRef}
                  onChange={onFileModalSelect}
                  id="myFileInput"
                  style={{ display: "none" }}
                />
                <label
                  role="button"
                  onClick={selectFiles}
                  className={cx("modal-upload")}
                >
                  Chọn ảnh
                </label>
              </div>
              <ImageList sx={{ width: 0.92 }}>
                {imageModals.map((item, index) => (
                  <ImageListItem key={item.url}>
                    <img
                      // srcSet={`${item.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                      // src={`${item.url}?w=248&fit=crop&auto=format`}
                      src={item.url}
                      alt={item.name}
                      // loading="lazy"
                    />
                    <ImageListItemBar
                      subtitle={item.name}
                      actionIcon={
                        <IconButton
                          sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                          aria-label={`info about ${item.name}`}
                          onClick={() => deleteImage(index)}
                        >
                          <CancelRoundedIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
              <div
                className={cx("modal-main-button")}
                style={{
                  position: "relative",
                }}
              >
                <Button
                  sx={{
                    fontFamily: "inherit",
                    textTransform: "none",
                    ":hover": {
                      opacity: 0.8,
                    },
                    opacity: creatingReport ? 0.5 : 1,
                  }}
                  onClick={handleCreateReport}
                  disabled={creatingReport}
                >
                  Tạo báo cáo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default HomePage;
