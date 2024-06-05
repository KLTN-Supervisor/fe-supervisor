import CloseIcon from "@mui/icons-material/Close";
import classNames from "classnames/bind";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./StudentCard.module.scss";
import { formatDate } from "../../../untils/format-date";
import { getStudentsImageSource } from "../../../untils/getImageSource";
import * as faceapi from "face-api.js";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import usePrivateHttpClient from "../../../hooks/http-hook/private-http-hook";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
const cx = classNames.bind(styles);

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

  const { privateRequest } = usePrivateHttpClient();
    const [modalAttendance, setModalAttendance] = useState(false);

    const toggleModalAttendance = async () => {
      if(!modalAttendance){
        setModalAttendance(!modalAttendance);
        setState(0);
        isLoadCanvasRef.current = true;
        await startVideo();
        videoRef?.current &&
          (intervalRef.current = setInterval(runFaceDetection, 2000));
      } else{
        await clear();
        imageRef.current = null;
        setIsDropping(false);
        setModalAttendance(!modalAttendance);
      }
    };

    const [state, setState] = useState(0);
    const videoRef = useRef();
    const canvasRef = useRef();
    const canvasImageRef = useRef();
    const isLoadCanvasRef = useRef(true);
    const intervalRef = useRef(null);
    let faceMatcher;

    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarNotif, setSnackBarNotif] = useState({
      severity: "success",
      message: "This is success message!",
    }); //severity: success, error, info, warning

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
  // const startVideo = () => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true })
  //     .then((currentStream) => {
  //       videoRef.current.srcObject = currentStream;
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((currentStream) => {
          videoRef.current.srcObject = currentStream;
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          setSnackBarNotif({
            severity: "error",
            message:
              "Xảy ra lỗi khi sử dụng camera"
          });
          setSnackBarOpen(true);
        });
    } else {
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
  // LOAD MODELS FROM FACE API

  const loadModels = async () => {
    if (student) {
      console.log(student);

      const trainingData = await loadTrainingData();
      faceMatcher = new faceapi.FaceMatcher(trainingData, 0.4);
      console.log(faceMatcher);
    }
  };

  const runFaceDetection = useCallback(async () => {
    console.log(" chay 1")
    !faceMatcher && loadModels();
    if (isLoadCanvasRef.current && faceMatcher && videoRef?.current) {
      console.log(" chay 2")
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
        height: screenWidth < 720 ? (screenWidth < 527 ? 225 : 300) : 480,
      });

      const resized = faceapi.resizeResults(detections, {
        width: videoRef.current ? videoRef.current.offsetWidth : 0,
        height: screenWidth < 720 ? (screenWidth < 527 ? 225 : 300) : 480,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        // const context = canvasRef.current.getContext('2d');
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        
        console.log(isAttendance);
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
  
  const onDrop = async(event) => {
    event.preventDefault();
    setIsDragging(false);
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
        height: 420,
      });

      const resized = faceapi.resizeResults(detections, {
        width: imageRef.current && imageRef.current.offsetWidth,
        height: 420,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        console.log("faceMatcher ne", faceMatcher);
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        // const drawBox = new faceapi.draw.DrawBox(box, {
        //   label:
        //     faceMatcher &&
        //     faceMatcher.findBestMatch(detection.descriptor).toString(),
        // });
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
          setSnackBarOpen(true);
          setTimeout(() => {
            toggleModalAttendance();
            setModal(false);
          }, 3000);
        }
        drawBox.draw(canvasImageRef.current);
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
        height: 420,
      });

      const resized = faceapi.resizeResults(detections, {
        width: imageRef.current && imageRef.current.offsetWidth,
        height: 420,
      });

      for (const detection of resized) {
        const box = detection.detection.box;
        console.log("faceMatcher ne", faceMatcher);
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label ? studentName : "unknown",
        });
        // const drawBox = new faceapi.draw.DrawBox(box, {
        //   label:
        //     faceMatcher &&
        //     faceMatcher.findBestMatch(detection.descriptor).toString(),
        // });
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
          setSnackBarOpen(true);
          setTimeout(() => {
            toggleModalAttendance();
            setModal(false);
          }, 3000);
          
        }
        drawBox.draw(canvasImageRef.current);
      }
    }
  };


  const handleClick = () => {
    if (home) {
      updateAttendance();
      setIsAttendance(!isAttendance);
    }
  };
  
  return (
    <>
      <div className={cx("student")} onClick={toggleModal}>
        <div style={{ height: "235px" }}>
          <img
            style={{ width: "100%", maxHeight: "235px" }}
            src={getStudentsImageSource(student.portrait_img)}
          />
        </div>
        <span
          style={{
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
            <div className={cx("modal-main")} style={{padding: "20px 0 30px 0px"}}>
              <div style={{ flex: 0.2, height: "100%", display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center"}}>
                <img
                  style={{ width: "100%", maxHeight: "250px", marginBottom: "15px" }}
                  src={getStudentsImageSource(student.portrait_img)}
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
                  <div className={cx("title")}>Lớp học phần:</div>
                  <span className={cx("span")}>{student.class}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalAttendance && (
        <div className={cx("modal active-modal")}>
          <div
            onClick={toggleModalAttendance}
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
            <div className={cx("modal-header")}>Điểm danh
            </div>
            <div className={cx("modal-main")} style={{flexDirection: "column", height: "540px", padding: "0px 0 30px 0px"}}>
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
                onClick={async () => {
                  isLoadCanvasRef.current = true;
                  setState(0);
                  await startVideo();
                  console.log(videoRef?.current);
                  videoRef?.current &&
                    (intervalRef.current = setInterval(runFaceDetection, 2000));
                  
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
                  imageRef.current = null;
                  setIsDropping(false);
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
                  className={cx("video")}
                ></video>
              </div>
              <canvas
                ref={canvasRef}
                width={videoRef?.current && videoRef?.current.offsetWidth}
                height="480"
                className={cx("appcanvas")}
              />
            </>
          ) : (
            <div
              style={{ width: "100%", height: "90%" }}
              onDragOver={isDropping ? null : onDragOver}
              onDragLeave={isDropping ? null : onDragLeave}
              onDrop={isDropping ? null : onDrop}
            >
              {isDropping ? (
                <div className={cx("content")} style={{flexDirection: "column"}}>
                  <div
                    className={cx("main")}
                    style={isDragging ? { backgroundColor: "black", height: "80%" } : { height: "80%" }}
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
                          minHeight: "420px",
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
                            justifyContent: "center",
                            flexShrink: "0",
                            flexGrow: "0",
                            borderRadius: "0px 0px 10px 10px",
                          }}
                        >
                          <img
                            ref={imageRef}
                            style={{
                              objectFit: "contain",
                              height: "420px",
                              display: "block",
                              flexShrink: "0",
                              flexGrow: "0",
                              borderRadius: "10px 10px 10px 10px",
                            }}
                            // src={images[0].url}
                          />
                          <canvas
                            ref={canvasImageRef}
                            style={{ position: "absolute", display: "inline-block" }}
                            width={imageRef.current?.naturalWidth}
                            height={imageRef.current?.naturalHeight}
                          />
                        </div>
                        
                      </div>
                    </div>
                  </div>
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
                      style={{marginBottom: 0}}
                      role="button"
                      onClick={selectFiles}
                      className={cx("modal-upload")}
                    >
                      Select from device
                    </label>
                  </div>
                </div>
              ) : (
                <div className={cx("content")} style={isDragging ? { backgroundColor: "#0094f61b" } : null}>
                  <div
                    className={cx("main")}
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
