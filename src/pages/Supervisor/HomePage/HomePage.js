import React, { useRef, useEffect, useState, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useLocation, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import useExamScheduleServices from "../../../services/useExamScheduleServices";
const img1 = require('../../../data/Duong/1.jpeg')
const img2 = require('../../../data/Duong/2.jpeg')
const cx = classNames.bind(styles);

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  let time ;
  let room ;
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

    
  const [state, setState] = useState(0);
  const { getStudents } = useExamScheduleServices();

  const videoRef = useRef();
  const canvasRef = useRef();
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
    time = location.state.time;
    room = location.state.room;
    getStudentsExam()

    const handleBeforeUnload = () => {
      clear();
    };

    const handleRouteChange = () => {
      navigate(location.pathname);
    };

    isLoadCanvasRef.current = true;
    startVideo();
    loadModels();
    

    window.addEventListener('beforeunload', handleBeforeUnload);
    navigate(handleRouteChange);

    return async () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      await clear();
      console.log("Chuyen trang ne");
    };
  }, []);
  useEffect(() => {
    console.log(videoRef.current?.srcObject)
    console.log("faceMatcher",faceMatcher)
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



  async function loadTrainingData(){
    const labels = ['20110627 - Nguyễn Khắc Dương']
    const faceDescriptors = []
    for (const label of labels){
      const descriptors = []
      // for(let i=1; i<3; i++){
      //   const image = await faceapi.fetchImage(`../../../data/${label}/${i}.jpeg`)
      //   const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
      //   descriptors.push(detection.descriptor)
      // }
      const image1 = await faceapi.fetchImage(img1)
      const detection = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor()
      descriptors.push(detection.descriptor)
      const image2 = await faceapi.fetchImage(img2)
      const detection2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor()
      descriptors.push(detection2.descriptor)
      faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
    }
    console.log(faceDescriptors);
    return faceDescriptors;
  }

  // STOP VIDEO STREAM FUNCTION
  const stopVideoStream = async () => {
    console.log("toi ch")
    navigator.mediaDevices.addEventListener("removetrack", (event) => {console.log(`${event.track.kind} track removed`);});
    console.log(videoRef.current && videoRef.current?.srcObject)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current?.srcObject;
      const tracks = stream?.getTracks();

      await tracks.forEach((track) => track.stop());
      console.log("tat ch")
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
    if(students.length > 0){
      console.log(students)
      await Promise.all([
        // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ])
      const trainingData = await loadTrainingData();
      faceMatcher = new faceapi.FaceMatcher(trainingData, 0.3);
      console.log(faceMatcher);
      videoRef?.current && (intervalRef.current = setInterval(runFaceDetection, 2000))
    }
    
  };

  const runFaceDetection = useCallback(async () => {
    
    if (isLoadCanvasRef.current) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHTML  = faceapi.createCanvas(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: canvasRef.current && canvasRef.current.offsetWidth,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: canvasRef.current && canvasRef.current.offsetWidth,
        height: 650,
      });

      for(const detection of resized){
        const box = detection.detection.box
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: await faceMatcher.findBestMatch(detection.descriptor).toString()
        })
        
        let check = false
        for(const student of students){
          if(student.student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label.substring(0, 9).trim()){
            check = true;
            break;
          }
            
        }
        
        if(check && !attendanceList.includes(faceMatcher.findBestMatch(detection.descriptor)._label) && faceMatcher.findBestMatch(detection.descriptor)._label!="unknown"){
          attendanceList.push(faceMatcher.findBestMatch(detection.descriptor)._label);
          const updatedStudents = students.map(student => {
            console.log(student.student.student_id.toString().localeCompare(faceMatcher.findBestMatch(detection.descriptor)._label.substring(0, 9).toString()));
            if (student.student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label.substring(0, 9).trim()) {
              return { ...student, attendance: true };
            }
            return student;
          });
          setStudents(updatedStudents);
          setSnackBarNotif({
            severity: "success",
            message: "Điểm danh thành công " + faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          console.log(attendanceList);
        }
        
        drawBox.draw(canvasRef.current)
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
        setIsFetched(true)
      } catch (err) {
        setStudentsLoading(false);
        console.log("get time error: ", err);
      }
    }
  };
  useEffect(() => {
    console.log(students)
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
    setIsDropping(true);
    
    const file = event.target.files[0];
    const image = await faceapi.bufferToImage(file);
    const canvas = faceapi.createCanvasFromMedia(image);
    
    imageRef.current.innerHTML = "";
    imageRef.current.append(image);
    imageRef.current.append(canvas);

    const size = {
      width: image.width,
      height: image.height
    }
    

    faceapi.matchDimensions(canvas, size);

    const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();
    const resized = faceapi.resizeResults(detections, size);
    console.log(resized);

    for(const detection of resized){
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: faceMatcher && faceMatcher.findBestMatch(detection.descriptor).toString()
      })
      if(students.find(student => {
        // Kiểm tra nếu student_id bằng với giá trị tương ứng
        return student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label.substring(0, 9).trim()}) 
        && !attendanceList.includes(faceMatcher.findBestMatch(detection.descriptor)._label) 
        && faceMatcher.findBestMatch(detection.descriptor)._label!="unknown")
        {
          attendanceList.push(faceMatcher.findBestMatch(detection.descriptor)._label);
          const updatedStudents = students.map(student => {
            if (student.student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label.substring(0, 9).trim()) {
              return { ...student, attendance: true };
            }
            return student;
          });
          setStudents(updatedStudents);
          setSnackBarNotif({
            severity: "success",
            message: "Điểm danh thành công " + faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          console.log(attendanceList);
        }
      
      drawBox.draw(canvas)
    }
  }

  const handleAttendance = (studentId) => {
    const updatedStudents = students.map(student => {
      if (student.student.student_id === studentId) {
        return { ...student, attendance: !student.attendance };
      }
      return student;
    });
    setStudents(updatedStudents);
    console.log(students)
  }

  

  return (
    <div className={cx("homepage")}>
      <div className={cx("homepage__navWraper")}>
        <Sidenav />
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
                    ? { color: "#00558d", borderBottom: "#00558d solid 1px", marginRight: "25px" }
                    : {marginRight: "25px"}
                }
                onClick={() => {
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
                    ? { color: "#00558d", borderBottom: "#00558d solid 1px", marginLeft: "25px" }
                    : {marginLeft: "25px"}
                }
                onClick={async() => {
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
          {state === 0 ? (<><div className={cx("appvide")}>
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
          /></>) : (
            <div
              style={{width: "100%", height: 650}} 
              onDragOver={isDropping ? null : onDragOver}
              onDragLeave={isDropping ? null : onDragLeave}
              onDrop={isDropping ? null : onDrop}>
            {isDropping ? (
              <div
                className={cx("modal-navbar-content")}
              >
                <div
                  className={cx("modal-main")}
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
                        ref={imageRef}
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
                        {/* <img
                          
                          style={{
                            width: "100%",
                            objectFit: "contain",
                            height: "auto",
                            display: "block",
                            flexShrink: "0",
                            flexGrow: "0",
                            borderRadius: "10px 10px 10px 10px",
                          }}
                          src={images[0].url}
                          
                        /> */}
                        {/* <canvas
                          ref={canvasRef}
                          width={imageRef && imageRef?.current.offsetWidth}
                          height="650"
                          className={cx("appcanvas")}
                        /> */}
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={cx("modal-navbar-content")}
              >
                <div
                  className={cx("modal-main")}
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
          </div>
        <div className={cx("attendance")}>
          <div className={cx("student__attend")}>
            <div className={cx("table__title", "mssv")}>MSSV</div>
            <div className={cx("table__title", "name")}>Họ tên</div>
            <div className={cx("table__title", "check")}>Điểm danh</div>
          </div>
          {!studentsLoading?
          (students.length > 0 && students.map((student, key) => (<div className={cx("student__attend")}>
              <div className={cx("table__content", "mssv")}>{student.student.student_id}</div>
              <div className={cx("table__content", "name")}>{student.student.last_name + " " + student.student.middle_name + " " + student.student.first_name}</div>
              <div className={cx("table__content", "check")} style={{cursor: "pointer"}} onClick={() => handleAttendance(student.student.student_id)}>{student.attendance ? "Có mặt" : "Vắng"}</div>
            </div>))) : 
            <div
              style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
              }}
              >
              <CircularProgress size={30} />
          </div>}
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

export default HomePage;
