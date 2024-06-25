import CloseIcon from "@mui/icons-material/Close";
import classNames from "classnames/bind";
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import styles from "./StudentCard.module.scss";
import styles2 from "../../../pages/Supervisor/HomePage/HomePage.module.scss";
import { formatDate } from "../../../untils/format-date";
import { getStudentsImageSource } from "../../../untils/getImageSource";
import * as faceapi from "face-api.js";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import { StateContext } from "../../../context/StateContext";
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';


const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);

function StudentCard({ student, attendance, home, updateAttendance, updateAttendanceTrue }) {
  const [modal, setModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(document.title);
  const [isAttendance, setIsAttendance] = useState(attendance);

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

  const [modalAttendance, setModalAttendance] = useState(false);

  const toggleModalAttendance = async () => {
    if(!modalAttendance ){
      setModalAttendance(!modalAttendance);
      setState(0);
      isLoadCanvasRef.current = true;
      await startVideo();
      videoRef?.current &&
        (intervalRef.current = setInterval(runFaceDetection, 2000));
    } else{
      if(videoRef){
        await clear();
      }
      imageRef.current = null;
      setIsDropping(false);
      setModalAttendance(!modalAttendance);
      setIsAttending(false);
    }
  };

  const [state, setState] = useState(0);
  const [cameraIds, setCameraIds] = useState('');
  const [currentCameraIndex , setCurrentCameraIndex ] = useState(0);
  const videoRef = useRef();
  const canvasRef = useRef();
  const isLoadCanvasRef = useRef(true);
  const intervalRef = useRef(null);
  const { faceMatcher } = useContext(StateContext);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarNotif, setSnackBarNotif] = useState({
    severity: "success",
    message: "This is success message!",
  }); //severity: success, error, info, warning

    // STOP VIDEO STREAM
  const clear = async () => {
    isLoadCanvasRef.current = false;
    // Stop the video stream
    if(videoRef.current !== null){
      await stopVideoStream();
    }
    // Stop the interval if it's running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };


  // STOP VIDEO STREAM FUNCTION
  const stopVideoStream = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      navigator.mediaDevices.addEventListener("removetrack", (event) => {
        console.log(`${event.track.kind} track removed`);
      });
    console.log(videoRef.current && videoRef.current?.srcObject);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current?.srcObject;
      const tracks = stream?.getTracks();

      await tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const getNumberOfCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      setCameraIds(cameras.map((camera) => camera.deviceId));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thiết bị:', error);
    }
  }

  // Hàm switch camera
  async function switchCamera() {
    try {
      // Lấy ID của camera tiếp theo
      const nextCameraId = currentCameraIndex == 0 ? 'environment' : "user";
      // Gọi getUserMedia với deviceId tương ứng
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: nextCameraId } }
      }).then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        setIsAttending(true);
        setCurrentCameraIndex(currentCameraIndex == 0 ? 1 : 0);
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        setSnackBarNotif({
          severity: "error",
          message:
            "Xảy ra lỗi khi sử dụng camera"
        });
        setIsAttending(false);
        setSnackBarOpen(true);
      });;
    } catch (error) {
      console.error('Lỗi khi switch camera:', error);
    }
  }

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((currentStream) => {
          getNumberOfCameras()
          videoRef.current.srcObject = currentStream;
          setIsAttending(true);
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          setSnackBarNotif({
            severity: "error",
            message:
              "Xảy ra lỗi khi sử dụng camera"
          });
          setIsAttending(false);
          setSnackBarOpen(true);
        });
    } else {
      videoRef.current = null;
      console.error('Trình duyệt không hỗ trợ camera');
      // Xử lý trường hợp trình duyệt không hỗ trợ API
      setSnackBarNotif({
        severity: "error",
        message:
          "Trình duyệt không hỗ trợ camera"
      });
      setSnackBarOpen(true);
    }
  };

  const runFaceDetection = useCallback(async () => {
    if (isLoadCanvasRef.current && faceMatcher && videoRef?.current) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const screenWidth = window.screen.width;
      console.log(screenWidth)
      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHTML = faceapi.createCanvas(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: videoRef.current ? videoRef.current.offsetWidth : 0,
        height: videoRef.current ? videoRef.current.offsetHeight : 0,
        // screenWidth < 720 ? (screenWidth < 527 ? 225 : 300) : 480,
      });

      const resized = faceapi.resizeResults(detections, {
        width: videoRef.current ? videoRef.current.offsetWidth : 0,
        height: videoRef.current ? videoRef.current.offsetHeight : 0,
        // screenWidth < 720 ? (screenWidth < 527 ? 225 : 300) : 480,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        const context = canvasRef.current.getContext('2d');
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        
        if( !isAttendance && student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label &&
          faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          isLoadCanvasRef.current = false;
          setIsAttendance(true)
          await updateAttendanceTrue();
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          videoRef.current.pause();
          // Sau 3 giây tắt video
          setTimeout(async () => {
            await clear();
            imageRef.current = null;
            setIsDropping(false);
            setModalAttendance(false);
            setModal(false);
          }, 3000);
        }
        drawBox.draw(canvasRef.current);
      }
      setIsAttending(false);
    }
  },[student, isAttendance, setIsAttendance]);

  useEffect(() => {
    if (videoRef?.current && !isAttendance && isLoadCanvasRef.current) {
      intervalRef.current = setInterval(runFaceDetection, 2000);
    }
  
    return () => {
      isLoadCanvasRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, [runFaceDetection]);

  //Hinh anh
  const [isDragging, setIsDragging] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
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
  
  const onDrop = async(event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (notValidFile(file)){
      setSnackBarNotif({
        severity: "error",
        message:
          "Chọn file không đúng định dạng" ,
      });
      setSnackBarOpen(true);
      setIsDropping(false);
      return;
    } 
    setIsAttending(true);
    const image = await faceapi.bufferToImage(file);
    const container = document.querySelector(`#imgDiv`);
    if (container) {
      const container = document.querySelector(`#imgDiv`);
      const canvas = faceapi.createCanvasFromMedia(image);
      container.innerHTML = '';
      container.append(image);
      container.append(canvas);

      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();

      faceapi.matchDimensions(canvas, {
        width: image && image.width,
        height: image && image.height,
      });

      const resized = faceapi.resizeResults(detections, {
        width: image && image.width,
        height: image && image.height,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        console.log(isAttendance, student.student_id, faceMatcher.findBestMatch(detection.descriptor)._label);
        if ( !isAttendance && student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label  
          && faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          setIsAttendance(true);
          updateAttendance();
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          console.log(student.student_id);
          setSnackBarOpen(true);
          setTimeout(() => {
            toggleModalAttendance();
            setModal(false);
          }, 3000);
        }
        drawBox.draw(canvas);
      }
    }
    setIsAttending(false);
  }

  //Validate file
  const notValidFile = (file) => {
    //image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm
    return (
      file.type !== "image/jpg" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/webp"
    );
  };

  function selectFiles() {
    fileInputRef.current.click();
  }

  const onFileSelect = async (event) => {
    setIsDropping(true);

    const file = event.target.files[0];
    if (notValidFile(file)){
      setSnackBarNotif({
        severity: "error",
        message:
          "Chọn file không đúng định dạng" ,
      });
      setSnackBarOpen(true);
      setIsDropping(false);
      return;
    } 
    setIsAttending(true);
    const image = await faceapi.bufferToImage(file);
    const container = document.querySelector(`#imgDiv`);
    if (container) {
      const container = document.querySelector(`#imgDiv`);
      const canvas = faceapi.createCanvasFromMedia(image);
      canvas.width = image.offsetWidth;
      canvas.height = image.offsetHeight;
      canvas.style.width = 'auto';
      canvas.style.left = 'auto';
      container.innerHTML = '';
      container.append(image);
      container.append(canvas);

      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();

      faceapi.matchDimensions(canvas, {
        width: image && image.offsetWidth,
        height: image && image.offsetHeight,
      });

      const resized = faceapi.resizeResults(detections, {
        width: image && image.offsetWidth,
        height: image && image.offsetHeight,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        console.log(isAttendance, student.student_id, faceMatcher.findBestMatch(detection.descriptor)._label);
        if ( !isAttendance && student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label  
          && faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          setIsAttendance(true);
          updateAttendance();
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          console.log(student.student_id);
          setSnackBarOpen(true);
          setTimeout(() => {
            toggleModalAttendance();
            setModal(false);
          }, 3000);
        }
        drawBox.draw(canvas);
      }
    }
    setIsAttending(false);
  };


  const handleClick = () => {
    if (home) {
      updateAttendance();
      setIsAttendance(false);
    }
  };
  
  return (
    <>
      <div className={cx("student")} onClick={toggleModal}>
        <div className={cx("student-image")}>
          <img
            style={{ width: "100%",  objectFit: "contain" }}
            src={getStudentsImageSource(student?.portrait_img)}
          />
        </div>
        <span
          style={{
            marginTop: "5px",
            fontSize: "16px",
            fontWeight: 500,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
          }}
        >
          {student.student_id}
        </span>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 450,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
          }}
        >
          {student.last_name +
            " " +
            student.middle_name +
            " " +
            student.first_name}
        </span>
        {attendance !== undefined && attendance === false && (
          <span
            style={{
              color: "#ed4956",
              marginBottom: "10px",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
            }}
          >
            Vắng thi
          </span>
        )}
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
          <div className={cx("modal-navbar-content")} style={{ width: "80%" }}>
            <div className={cx("modal-header")}>Thông tin sinh viên</div>
            <div className={cx("modal-main")} style={{padding: "10px 0 0px 0px"}}>
              <div style={{ flex: 0.25, marginLeft: 20, height: "100%", display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center"}}>
                <div
                  style={{
                    display:"flex", justifyContent: "center", flexDirection: "column", alignItems: "center",
                    // height: "290px",
                  }}>
                  <img
                    style={{ width: "100%", maxHeight: "200px", marginBottom: "15px" }}
                    src={getStudentsImageSource(student?.portrait_img)}
                  />
                  {!attendance && !isAttendance ? (
                    <span
                      style={{
                        cursor: home ? "pointer" : "default",
                        color: "#ed4956",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: 500,
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
                      }}
                      onClick={handleClick}
                    >
                      Vắng thi
                    </span>
                  ): (
                    <span
                      style={{
                        cursor: home ? "pointer" : "default",
                        color: "rgb(73 237 136)",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: 500,
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
                      }}
                      onClick={handleClick}
                    >
                      Có mặt
                    </span>
                  )}
                  {home && !attendance && !isAttendance &&
                    <div
                      onClick={toggleModalAttendance}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#0095f6",
                        padding: "10px",
                        color: "white",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Điểm danh
                    </div>
                  }
                </div>
              </div>
              <div className={cx("modal-info")}>
                <div className={cx("info")}>
                  <div className={cx("title")}>MSSV:</div>
                  <span className={cx("span")}>{student.student_id}</span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Họ và tên:</div>
                  <span className={cx("span")}>
                    {student.last_name +
                      " " +
                      student.middle_name +
                      " " +
                      student.first_name}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>CMND/CCCD:</div>
                  <span className={cx("span")}>
                    {student.citizen_identification_number}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Giới tính:</div>
                  <span className={cx("span")}>
                    {student.gender ? "Nam" : "Nữ"}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Ngày sinh:</div>
                  <span className={cx("span")}>
                    {formatDate(student.date_of_birth)}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Nơi sinh:</div>
                  <span className={cx("span")}>{student.place_of_birth}</span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Tỉnh/TP:</div>
                  <span className={cx("span")}>
                    {student.permanent_address.city_or_province}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Quận/huyện:</div>
                  <span className={cx("span")}>
                    {student.permanent_address.district}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Địa chỉ thường trú:</div>
                  <span className={cx("span")}>
                    {student.permanent_address.address}
                  </span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Quốc tịch:</div>
                  <span className={cx("span")}>{student.nationality}</span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Khoa:</div>
                  <span className={cx("span")}>{student.faculty.toString().replace(/^Khoa\s*/, "")}</span>
                </div>
                <div className={cx("info")}>
                  <div className={cx("title")}>Chuyên ngành:</div>
                  <span className={cx("span")}>{student.major}</span>
                </div>
                <div className={cx("info")} >
                  <div className={cx("title")}>Lớp học phần:</div>
                  <span className={cx("span")}>{student.class}</span>
                </div>
                <div style={{height: 20, width: 20, display: "inline-block"}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalAttendance && (
        <div className={cx2("modal active-modal")}>
          <div
            onClick={toggleModalAttendance}
            className={cx2("overlay")}
            style={{ alignSelf: "flex-end" }}
          >
            <CloseIcon
              className={cx2("sidenav__icon")}
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
          <div className={cx2("modal-navbar-content")} style={{ width: "80%" }}>
            <div className={cx2("modal-header")}>Điểm danh
            </div>
            <div className={cx2("modal-main")} style={{flexDirection: "column", height: "540px", padding: "0px 0 30px 0px"}}>
            <div className={cx2("home__tag")}>
            <a>
              <div
                className={cx2("choose")}
                style={
                  state === 0
                    ? {
                        color: "#00558d",
                        borderBottom: "#00558d solid 1px",
                        marginRight: "25px",
                      }
                    : { marginRight: "25px" }
                }
                onClick={async () => {
                  isLoadCanvasRef.current = true;
                  setState(0);
                  await startVideo();
                  console.log(videoRef?.current);
                  videoRef?.current !== null &&
                    (intervalRef.current = setInterval(runFaceDetection, 2000));
                  
                }}
              >
                <CameraAltOutlinedIcon className={cx2("icon")} />
                <span
                  className={cx2("span")}
                  style={{ textTransform: "uppercase" }}
                >
                  Camera
                </span>
              </div>
            </a>
            <a>
              <div
                className={cx2("choose")}
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
                  if(videoRef.current !== null){
                    await clear();
                  }
                  imageRef.current = null;
                  setIsDropping(false);
                  setState(1);
                  setIsAttending(false);
                }}
              >
                <ImageOutlinedIcon className={cx2("icon")} />
                <span
                  className={cx2("span")}
                  style={{ textTransform: "uppercase" }}
                >
                  Hình ảnh
                </span>
              </div>
            </a>
          </div>
          {state === 0 ? (
            <>
              <div className={cx2("appvide")}>
                <video
                  crossOrigin="anonymous"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ borderRadius: cameraIds.length > 1 ? "2% 2% 0 0" : "2% 2% 2% 2%" }}
                  className={cx2("video")}
                ></video>
              </div>
              {cameraIds.length > 1 &&
                <div onClick={switchCamera} className={cx2("switch-video")} 
                  style={{padding: "15px 0", display: "flex", justifyContent: "center", backgroundColor: "rgb(173 173 173)", 
                  borderRadius: "0px 0 10px 10px", cursor: "pointer", width: videoRef?.current && videoRef?.current.offsetWidth}}
                >
                  <CameraswitchIcon style={{color: "#00558d"}}/>
                </div>
              }
              <canvas
                ref={canvasRef}
                width={videoRef?.current && videoRef?.current.offsetWidth}
                height={videoRef?.current && videoRef?.current.height}
                className={cx2("appcanvas")}
              />
              <div
                style={{
                  display: isAttending ? "block" : "none",
                  position: "absolute",
                  zIndex: 5,
                  top: "102px",
                  width: "100%",
                  height: "82%",
                  backgroundColor: "white",
                  textAlign: "center",
                  fontWeight: 600,
                  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Helvetica, Arial, sans-serif`,
                  color: "rgb(61 60 60)",
                }}
              >
                <CircularProgress size={25} style={{marginTop: 10}}/>
                <br/>
                Đang chuẩn bị camera ...
              </div>
            </>
          ) : (
            <div
              style={{ width: "100%", height: "90%" }}
              onDragOver={isDropping ? null : onDragOver}
              onDragLeave={isDropping ? null : onDragLeave}
              onDrop={isDropping ? null : onDrop}
            >
              {isDropping ? (
                <div className={cx2("content")} style={{flexDirection: "column"}}>
                  <div
                    className={cx2("main")}
                    style={isDragging ? { backgroundColor: "black", height: "80%" } : { height: "80%" }}
                  >
                    <div
                      className={cx2("container")}
                      style={{
                        borderRadius: "10px 10px 10px 10px",
                        display: "flex",
                      }}
                    >
                      <div
                        className={cx2("image")}
                        style={{
                          display: !isAttending ? "flex" : "none",
                          minHeight: "420px",
                          width: "100%",
                          justifyContent: "center",
                          display: "flex",
                          overflow: "hidden",
                        }}
                      >
                        <div className={cx2("image-slider-container")}>
                          <div
                            id={`imgDiv`}
                            className={cx2("image-slider")}
                            style={{ display: "flex !important", justifyContent: "center", alignItems: "center" }}
                          ></div>
                        </div>
                        
                      </div>
                      <div
                        style={{
                          display: isAttending ? "block" : "none",
                          width: "100%",
                          textAlign: "center",
                          fontWeight: 600,
                          fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                        Helvetica, Arial, sans-serif`,
                          color: "rgb(61 60 60)",
                        }}
                      >
                        <CircularProgress size={25}/>
                        <br/>
                        Đang kiểm tra hình ảnh
                      </div>
                    </div>
                  </div>
                  {!isAttendance &&
                  <div className={cx2("modal-input")} style={{marginTop: 0}}>
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
                      style={{marginBottom: 0}}
                      role="button"
                      onClick={selectFiles}
                      className={cx2("modal-upload")}
                    >
                      Select from device
                    </label>
                  </div>}
                </div>
              ) : (
                <div className={cx2("content")} style={{display: "flex", backgroundColor: isDragging && "#0094f61b"}}>
                  <div
                    style={{height: "auto"}}
                    className={cx2("main")}
                  >
                    <div>
                      <div className={cx2("modal-image")}>
                        <CollectionsOutlinedIcon className={cx2("modal-logo")} />
                      </div>
                      {isDragging ? (
                        <div className={cx2("modal-text")}>
                          Thả hình ảnh vào đây
                        </div>
                      ) : (
                        <div className={cx2("modal-text")}>
                          Kéo hình ảnh vào đây
                        </div>
                      )}

                      <div className={cx2("modal-input")}>
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
                          className={cx2("modal-upload")}
                        >
                          Select from device
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}</div>
            )}
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
    </>
  );
}
export default StudentCard;
