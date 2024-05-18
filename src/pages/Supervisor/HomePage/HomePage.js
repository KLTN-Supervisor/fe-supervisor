import React, { useRef, useEffect, useState, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useLocation, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import ListSubheader from "@mui/material/ListSubheader";
import IconButton from "@mui/material/IconButton";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import usePrivateHttpClient from "../../../hooks/http-hook/private-http-hook";
const cx = classNames.bind(styles);

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { privateRequest } = usePrivateHttpClient();
  // Lưu giá trị vào localStorage khi trang được tải
  useEffect(() => {
    if (location.state) {
      localStorage.setItem("time", location.state.time);
      localStorage.setItem("room", location.state.room);
    }
  }, [location.state]);

  // Đọc giá trị từ localStorage khi trang được tải lại
  const { time, room } = location.state ?? {
    time: localStorage.getItem("time") || "",
    room: localStorage.getItem("room") || "",
  };

  // let time, room;

  // if (location.state) {
  //   ({ time, room } = location.state);
  // }

  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

  const [state, setState] = useState(0);
  const { getStudents } = useExamScheduleServices();

  const videoRef = useRef();
  const canvasRef = useRef();
  const canvasImageRef = useRef();
  const isLoadCanvasRef = useRef(true);
  const intervalRef = useRef(null);
  let faceMatcher;
  let attendanceList = [];

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarNotif, setSnackBarNotif] = useState({
    severity: "success",
    message: "This is success message!",
  }); //severity: success, error, info, warning

  // // LOAD FROM USEEFFECT
  // useEffect(() => {
  //   isLoadCanvasRef.current = true;

  //   startVideo();
  //   videoRef?.current && loadModels();

  //   return () => {
  //     clear();
  //   };
  // }, []);

  useEffect(() => {
    // time = location.state.time;
    // room = location.state.room;
    // getStudentsExam()

    const handleBeforeUnload = () => {
      clear();
    };

    const handleRouteChange = () => {
      navigate(location.pathname);
    };

    isLoadCanvasRef.current = true;
    startVideo();
    loadModels();

    window.addEventListener("beforeunload", handleBeforeUnload);
    navigate(handleRouteChange);

    return async () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      await clear();
      console.log("Chuyen trang ne");
    };
  }, []);
  useEffect(() => {
    console.log(videoRef.current?.srcObject);
    console.log("faceMatcher", faceMatcher);
  }, [videoRef.current?.srcObject, faceMatcher]);

  // STOP VIDEO STREAM
  const clear = async () => {
    isLoadCanvasRef.current = false;
    // Stop the video stream
    await stopVideoStream();
    // Stop the interval if it's running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const loadTrainingData = async () => {
    try {
      const response = await privateRequest(`/train/`);
      console.log(response);
      const labeledFaceDescriptors = response.data
        .map((x) => {
          console.log(x);
          const descriptors = x.descriptors.map(
            (descriptor) => new Float32Array(descriptor)
          );
          console.log(descriptors);
          return new faceapi.LabeledFaceDescriptors(x.label, descriptors);
        })
        .filter(Boolean);
      return labeledFaceDescriptors;
    } catch (err) {
      throw err;
    }
  };

  // STOP VIDEO STREAM FUNCTION
  const stopVideoStream = async () => {
    console.log("toi ch");
    navigator.mediaDevices.addEventListener("removetrack", (event) => {
      console.log(`${event.track.kind} track removed`);
    });
    console.log(videoRef.current && videoRef.current?.srcObject);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current?.srcObject;
      const tracks = stream?.getTracks();

      await tracks.forEach((track) => track.stop());
      console.log("tat ch");
      videoRef.current.srcObject = null;
    }
  };

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // LOAD MODELS FROM FACE API

  const loadModels = async () => {
    if (students.length > 0) {
      console.log(students);

      const trainingData = await loadTrainingData();
      faceMatcher = new faceapi.FaceMatcher(trainingData, 0.4);
      console.log(faceMatcher);
      videoRef?.current &&
        (intervalRef.current = setInterval(runFaceDetection, 2000));
    }
  };

  const runFaceDetection = useCallback(async () => {
    if (isLoadCanvasRef.current) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHTML = faceapi.createCanvas(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: videoRef.current && videoRef.current.offsetWidth,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: videoRef.current && videoRef.current.offsetWidth,
        height: 650,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: await faceMatcher
            .findBestMatch(detection.descriptor)
            .toString(),
        });

        let check = false;
        for (const student of students) {
          if (
            student.student.student_id.toString().trim() ===
            faceMatcher
              .findBestMatch(detection.descriptor)
              ._label.substring(0, 9)
              .trim()
          ) {
            check = true;
            break;
          }
        }

        if (
          check &&
          !attendanceList.includes(
            faceMatcher.findBestMatch(detection.descriptor)._label
          ) &&
          faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          attendanceList.push(
            faceMatcher.findBestMatch(detection.descriptor)._label
          );
          const updatedStudents = students.map((student) => {
            console.log(
              student.student.student_id
                .toString()
                .localeCompare(
                  faceMatcher
                    .findBestMatch(detection.descriptor)
                    ._label.substring(0, 9)
                    .toString()
                )
            );
            if (
              student.student.student_id.toString().trim() ===
              faceMatcher
                .findBestMatch(detection.descriptor)
                ._label.substring(0, 9)
                .trim()
            ) {
              return { ...student, attendance: true };
            }
            return student;
          });
          setStudents(updatedStudents);
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          console.log(attendanceList);
        }

        drawBox.draw(canvasRef.current);
      }
      // faceapi.draw.drawDetections(canvasRef.current, resized);
      // faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      // faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }
  }, [students]);

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
  }, [time, room]);
  useEffect(() => {
    console.log(students);
    loadModels();
  }, [isFetched]);

  //Hinh anh
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef();
  //Kéo thả ảnh vào phần tạo bài viết
  function onDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  }
  function onDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }
  function onDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      if (notValidFile(files[i])) continue;
      if (!images.some((e) => e.name === files[i].name)) {
        setImages((prevImages) => [
          ...prevImages,
          {
            name: files[i].name,
            url: URL.createObjectURL(files[i]),
            file: files[i],
          },
        ]);
      }
    }
    setIsDropping(true);
  }

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

  const onFileSelect = async (event) => {
    !faceMatcher && loadModels();
    !students && getStudents();
    setIsDropping(true);

    const file = event.target.files[0];
    const image = await faceapi.bufferToImage(file);
    console.log(image);
    if (imageRef.current) {
      imageRef.current.src = image.src;

      const detections = await faceapi
        .detectAllFaces(imageRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      canvasImageRef.current.innerHTML = faceapi.createCanvas(imageRef.current);
      faceapi.matchDimensions(canvasImageRef.current, {
        width: imageRef.current && imageRef.current.offsetWidth,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: imageRef.current && imageRef.current.offsetWidth,
        height: 650,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        console.log("faceMatcher ne", faceMatcher);
        const drawBox = new faceapi.draw.DrawBox(box, {
          label:
            faceMatcher &&
            faceMatcher.findBestMatch(detection.descriptor).toString(),
        });
        let check = false;
        if (students) {
          for (const student of students) {
            console.log(student.student.student_id);
            if (
              student.student.student_id.toString() ===
              faceMatcher
                .findBestMatch(detection.descriptor)
                ._label.substring(0, 9)
                .trim()
            ) {
              check = true;
              break;
            }
          }
        }
        console.log(students);
        if (
          check &&
          !attendanceList.includes(
            faceMatcher.findBestMatch(detection.descriptor)._label
          ) &&
          faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          attendanceList.push(
            faceMatcher.findBestMatch(detection.descriptor)._label
          );
          const updatedStudents = students.map((student) => {
            if (
              student.student.student_id.toString().trim() ===
              faceMatcher
                .findBestMatch(detection.descriptor)
                ._label.substring(0, 9)
                .trim()
            ) {
              return { ...student, attendance: true };
            }
            return student;
          });
          setStudents(updatedStudents);
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          console.log(attendanceList);
        }
        drawBox.draw(canvasImageRef.current);
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvasContext = canvasRef.current.getContext("2d");
      canvasContext.willReadFrequently = true;
    }
  }, [canvasRef]);

  const handleAttendance = (studentId) => {
    const updatedStudents = students.map((student) => {
      if (student.student.student_id === studentId) {
        return { ...student, attendance: !student.attendance };
      }
      return student;
    });
    setStudents(updatedStudents);
    console.log(students);
  };

  //reports
  const [modal, setModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(document.title);

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

  const [report, setReport] = useState("");
  const handleChange = (event) => {
    setReport(event.target.value);
  };

  const [imageModals, setImageModals] = useState([]);

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

  return (
    <div className={cx("homepage")}>
      <div className={cx("homepage__navWraper")}>
        <Sidenav clear={clear} />
      </div>
      <div className={cx("homepage__timeline")}>
        <div className={cx("myapp")}>
          <h1>Điểm danh</h1>
          <div className={cx("home__tag")}>
            <a>
              <div
                className={cx("choose")}
                style={
                  state === 0
                    ? {
                        color: "#00558d",
                        borderBottom: "#00558d solid 1px",
                        marginRight: "25px",
                      }
                    : { marginRight: "25px" }
                }
                onClick={() => {
                  isLoadCanvasRef.current = true;
                  startVideo();
                  console.log(videoRef?.current);
                  videoRef?.current &&
                    (intervalRef.current = setInterval(runFaceDetection, 2000));
                  setState(0);
                }}
              >
                <CameraAltOutlinedIcon className={cx("icon")} />
                <span
                  className={cx("span")}
                  style={{ textTransform: "uppercase" }}
                >
                  Camera
                </span>
              </div>
            </a>
            <a>
              <div
                className={cx("choose")}
                style={
                  state === 1
                    ? {
                        color: "#00558d",
                        borderBottom: "#00558d solid 1px",
                        marginLeft: "25px",
                      }
                    : { marginLeft: "25px" }
                }
                onClick={async () => {
                  await clear();
                  setState(1);
                }}
              >
                <ImageOutlinedIcon className={cx("icon")} />
                <span
                  className={cx("span")}
                  style={{ textTransform: "uppercase" }}
                >
                  Hình ảnh
                </span>
              </div>
            </a>
          </div>
          {state === 0 ? (
            <>
              <div className={cx("appvide")}>
                <video
                  crossOrigin="anonymous"
                  ref={videoRef}
                  autoPlay
                  style={{ borderRadius: 10 }}
                ></video>
              </div>
              <canvas
                ref={canvasRef}
                width={videoRef?.current && videoRef?.current.offsetWidth}
                height="650"
                className={cx("appcanvas")}
              />
            </>
          ) : (
            <div
              style={{ width: "100%", height: 650 }}
              onDragOver={isDropping ? null : onDragOver}
              onDragLeave={isDropping ? null : onDragLeave}
              onDrop={isDropping ? null : onDrop}
            >
              {isDropping ? (
                <div className={cx("content")}>
                  <div
                    className={cx("main")}
                    style={isDragging ? { backgroundColor: "black" } : null}
                  >
                    <div
                      className={cx("container")}
                      style={{
                        borderRadius: "10px 10px 10px 10px",
                        display: "flex",
                      }}
                    >
                      <div
                        className={cx("image")}
                        style={{
                          minHeight: "400px",
                          width: "100%",
                          display: "flex",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className={cx("img-slider")}
                          style={{
                            width: "100%",
                            transition: "transform 0.2s",
                            display: "flex",
                            flexShrink: "0",
                            flexGrow: "0",
                            borderRadius: "0px 0px 10px 10px",
                          }}
                        >
                          <img
                            ref={imageRef}
                            style={{
                              width: "100%",
                              objectFit: "contain",
                              height: "650px",
                              display: "block",
                              flexShrink: "0",
                              flexGrow: "0",
                              borderRadius: "10px 10px 10px 10px",
                            }}
                            // src={images[0].url}
                          />
                          <canvas
                            ref={canvasImageRef}
                            style={{ position: "absolute" }}
                            width={imageRef && imageRef?.current?.offsetWidth}
                            height="650px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cx("content")}>
                  <div
                    className={cx("main")}
                    style={isDragging ? { backgroundColor: "#0094f61b" } : null}
                  >
                    <div>
                      <div className={cx("modal-image")}>
                        <CollectionsOutlinedIcon className={cx("modal-logo")} />
                      </div>
                      {isDragging ? (
                        <div className={cx("modal-text")}>
                          Thả hình ảnh vào đây
                        </div>
                      ) : (
                        <div className={cx("modal-text")}>
                          Kéo hình ảnh vào đây
                        </div>
                      )}

                      <div className={cx("modal-input")}>
                        <input
                          type="file"
                          accept="image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                          multiple
                          ref={fileInputRef}
                          onChange={onFileSelect}
                          id="myFileInput"
                          style={{ display: "none" }}
                        />
                        <label
                          role="button"
                          onClick={selectFiles}
                          className={cx("modal-upload")}
                        >
                          Select from device
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={cx("title")}>
          <h6 className={cx("text")}>Danh sách điểm danh</h6>
          <div
            onClick={toggleModal}
            style={{
              position: "absolute",
              right: "4%",
              bottom: "-60px",
              display: "inline-block",
              backgroundColor: "#0095f6",
              padding: "10px",
              color: "white",
              borderRadius: "10px",
            }}
          >
            Lập biên bản
          </div>
        </div>
        <div className={cx("attendance")}>
          <div className={cx("student__attend")}>
            <div className={cx("table__title", "mssv")}>MSSV</div>
            <div className={cx("table__title", "name")}>Họ tên</div>
            <div className={cx("table__title", "check")}>Điểm danh</div>
          </div>
          {!studentsLoading ? (
            students.length > 0 &&
            students.map((student) => (
              <div
                key={student.student.student_id}
                className={cx("student__attend")}
              >
                <div className={cx("table__content", "mssv")}>
                  {student.student.student_id}
                </div>
                <div className={cx("table__content", "name")}>
                  {student.student.last_name +
                    " " +
                    student.student.middle_name +
                    " " +
                    student.student.first_name}
                </div>
                <div
                  className={cx("table__content", "check")}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAttendance(student.student.student_id)}
                >
                  {student.attendance ? "Có mặt" : "Vắng"}
                </div>
              </div>
            ))
          ) : (
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
            <div className={cx("modal-header")}>Biên bản báo cáo</div>
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
                    value={report}
                    onChange={handleChange}
                    displayEmpty
                    disableUnderline
                    inputProps={{ "aria-label": "Without label" }}
                    sx={{ height: "100%" }}
                  >
                    <MenuItem value="">
                      <em>Chọn loại biên bản</em>
                    </MenuItem>
                    <MenuItem value="Absence">Vắng thi</MenuItem>
                    <MenuItem value="Foul">Vi phạm qui chế thi</MenuItem>
                    <MenuItem value="Other">Khác</MenuItem>
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
                  // value={bio}
                  // onChange={(e) => {
                  //   setBio(e.target.value);
                  // }}
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
                    // opacity: !bioModified || updateProfileLoading ? 0.5 : 1,
                  }}
                  // onClick={updateBio}
                  // disabled={!bioModified || updateProfileLoading}
                >
                  Lập biên bản
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
