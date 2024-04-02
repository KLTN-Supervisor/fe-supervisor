import React, {  useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useNavigate } from "react-router-dom";
import * as faceapi from 'face-api.js'

const cx = classNames.bind(styles);

function HomePage() {
  // const navigate = useNavigate();


  const videoRef = useRef()
  const canvasRef = useRef()
  const intervalRef = useRef(null);

  // LOAD FROM USEEFFECT
  useEffect(()=>{
    startVideo()
    videoRef && loadModels()
  },[])



  // OPEN YOU FACE WEBCAM
  const startVideo = ()=>{
    navigator.mediaDevices.getUserMedia({video:true})
    .then((currentStream)=>{
      videoRef.current.srcObject = currentStream
    })
    .catch((err)=>{
      console.log(err)
    })
  }
  // LOAD MODELS FROM FACE API

  const loadModels = ()=>{
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")

      ]).then(()=>{
      faceMyDetect()
    })
  }

  const faceMyDetect = ()=>{
    const runFaceDetection = async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvas(videoRef.current)
      faceapi.matchDimensions(canvasRef.current,{
        width:940,
        height:650
      })

      const resized = faceapi.resizeResults(detections,{
        width:940,
        height:650
      })

      faceapi.draw.drawDetections(canvasRef.current,resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current,resized)
    };
    intervalRef.current = setInterval(runFaceDetection, 1000);
    setTimeout(() => {
      clearInterval(intervalRef.current);

      const stream = videoRef.current.srcObject;
      console.log(stream);
      // Lấy danh sách các track trong stream
      const tracks = stream.getTracks();

      // Dừng tất cả các track trong stream
      tracks.forEach(track => track.stop());

      // Xóa đối tượng stream khỏi video element
      videoRef.current.srcObject = null;

    }, 1000000);
    
  }


  return (
    <div className={cx("homepage")}>
      <div className={cx("homepage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("homepage__timeline")}>
      <div className={cx("myapp")}>
        <h1>Điểm danh</h1>
          <div className={cx("appvide")}>
            <video crossOrigin="anonymous" ref={videoRef} autoPlay style={{borderRadius: 10}}></video>
          </div>
          <canvas ref={canvasRef} width="940" height="650"
            className={cx("appcanvas")}/>
        </div>
      </div>
    </div>
  );
}

export default HomePage;