import React, { useRef, useEffect, useState, useCallback, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingCard from "../../../components/LoadingCard";
import StudentCard from "../../../components/Supervisor/StudentCard";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
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
import { formatDate, formatHour, formatDateExtend, formatHourExtend } from "../../../untils/format-date";
import usePrivateHttpClient from "../../../hooks/http-hook/private-http-hook";
import * as XLSX from "xlsx";
import * as xlsxPopulate from "xlsx-populate/browser/xlsx-populate";
import * as faceapi from "face-api.js";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { StateContext } from "../../../context/StateContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';

const cx = classNames.bind(styles);

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { privateRequest } = usePrivateHttpClient();
  const { getStudents, attendanceStudent, noteReport, getExamReport, deleteExamReport, getRoomInfo, writeExcel } =
    useExamScheduleServices();

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef()
  const NextArrow = () => {
    return (
      <button
        type="button"
        className={cx("slick-next")}
        style={{display: currentSlide === images.length - 1 ? 'none' : 'flex'}}
        onClick={() => sliderRef.current.slickNext()}
      >
        <ArrowForwardIosIcon
          style={{
            width: "16px",
            height: "16px",
            // marginBottom: "2px",
            marginLeft: "3px",
            color: "white"
          }}
          aria-hidden
        />
      </button>
    );
  };

  const BackArrow = () => {
    return (
      <button
        type="button"
        className={cx("slick-prev")}
        style={{display: currentSlide === 0 ? 'none' : 'flex'}}
        onClick={() => sliderRef.current.slickPrev()}
      >
        <ArrowBackIosNewIcon
          style={{
            width: "16px",
            height: "16px",
            // marginBottom: "2px",
            marginRight: "3px",
            color: "white"
          }}
          aria-hidden
        />
      </button>
    );
  };
  // <ArrowBackIosNewIcon
  //   style={{
  //     width: "16px",
  //     height: "16px",
  //     marginBottom: "2px",
  //   }}
  //   aria-hidden
  // />
  
  const settings = {
      dots: true,
      centerMode: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: false,
      initialSlide: 0,
      autoplay: true,
      autoplaySpeed: 3000,
      nextArrow: <NextArrow/>,
      prevArrow: <BackArrow/>,
      afterChange: (index) => setCurrentSlide(index),
    };
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
  const [info, setInfo] = useState({});
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

  const getInfo = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getRoomInfo(time, room);
        setInfo(response);
        setStudentsLoading(false);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get time error: ", err);
      }
    }
  };

  
  useEffect(() => {
    document.title = currentTitle;
    getInfo();
    getStudentsExam();
    getReportsExam()
  }, [time, room]);

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
  const currentTitle = roomName;

  const [reportType, setReportType] = useState("");
  const handleChange = (event) => {
    setReportType(event.target.value);
  };
  const [note, setNote] = useState("");
  const [imageModals, setImageModals] = useState([]);

  const toggleModal = () => {
    if (document.body.style.overflow !== "hidden") {
      document.body.style.overflow = "hidden";
      document.title = "Báo cáo";
    } else {
      document.body.style.overflow = "auto";
      document.title = currentTitle;
    }
    setModal(!modal);
  };

  const toggleModalCreate = () => {
    if(modalCreate)
      document.title = "Tạo báo cáo";
    else
      document.title = currentTitle;
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

          setReport((prev) => [...prev, newReport]);
          toggleModalCreate();
          setSnackBarNotif({
            severity: "success",
            message: reportType == "REPORT" ? "Tạo biên bản thành công" : "Tạo sự cố thành công",
          });
          setSnackBarOpen(true);
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
      students.map((student) => {
        if (student.student.student_id === studentId) {
          attendanceStudent(time, room, studentId, true);
          return { ...student, attendance: true };
        }
        return student;
      })
    );

    await setStudents(updatedStudents);
  };

  // const printHandle = () => {
  //   // navigate(`/print?time=${time}&&room=${room}`);
  //   window.open(`/print?time=${time}&&room=${room}`);
  // };

  const printHandle = () => {
    handleExport().then((url) => {
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.href = url;
      downloadAnchorNode.setAttribute('download', `DSSVDuThi_${formatDateExtend(info.start_time)}_${formatHourExtend(info.start_time)}_${info.room_name}.xlsx`);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }

  const s2ab = (s) =>{
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for(let i=0; i!== s.length; ++i){
      view[i] = s.charCodeAt(i)
    }
    return buf; 
  }

  const workbook2blob = (workbook) => {
    const wopts = {
      bookType: "xlsx",
      type: "binary",
    };

    const wbout = XLSX.write(workbook, wopts);

    const blob = new Blob([s2ab(wbout)], {
      type: "application/octet-stream"
    });

    return blob
  }

  function countObjectsWithAttendanceTrue(data) {
    let count = 0;
    for (let obj of data) {
      if (obj.L === "Có mặt") {
        count++;
      }
    }
    return count;
  }
  
  const handleExport = () => {
    let table = []
    for(let i=1; i<= students.length; ++i){
      table.push({
        B: i, 
        C: students[i-1].student.student_id, 
        D: students[i-1].student.last_name +
          " " +
          students[i-1].student.middle_name,
        E: students[i-1].student.first_name,
        F: formatDate(students[i-1].student.date_of_birth),
        G: "",
        H: "",
        I: "",
        J: "",
        K: students[i-1].student.class,
        L: students[i-1].attendance ? "Có mặt" : "Vắng thi",
      })
    }
    const tableTitle = [{B: "STT", C: "Mã SV", D: "Họ và tên", E: "Ngày sinh", F: "Số tờ", G: "Điểm số", H: "Điểm chữ", I: "Chữ ký", J: "Tên lớp", K: "Điểm danh"}];

    const finalData = [...tableTitle, ...table]
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(finalData, { origin: 'B20', skipHeader: true });

    XLSX.utils.book_append_sheet(workbook, worksheet, `${info.room_name}`);

    const workbookBlob = workbook2blob(workbook)

    return addStyles(workbookBlob, finalData)
  }

  const addStyles = (workbookBlob, finalData) =>{
    return xlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
      workbook.sheets().forEach((sheet) => {
        sheet.gridLinesVisible(false) 
        sheet.column('A').width(1.4);
        sheet.column('B').width(1.3);
        sheet.column('C').width(2.4);
        sheet.column('D').width(8.1);
        sheet.column('E').width(0.4);
        sheet.column('F').width(2.5);
        sheet.column('G').width(6.1);
        sheet.column('H').width(3.6);
        sheet.column('I').width(2.5);
        sheet.column('J').width(3.4);
        sheet.column('K').width(2.5);
        sheet.column('L').width(3.9);
        sheet.column('M').width(4.2);
        sheet.column('N').width(1);
        sheet.column('O').width(0.3);
        sheet.column('P').width(0.6);
        sheet.column('Q').width(8.7);
        sheet.column('R').width(6.1);
        sheet.column('S').width(4.3);
        sheet.column('T').width(2.4);
        sheet.column('U').width(4.9);
        sheet.column('V').width(0.1);
        sheet.column('W').width(4);
        sheet.column('X').width(0.9);
        sheet.column('Y').width(2.4);
        sheet.column('Z').width(1.5);
        sheet.column('AA').width(2.4);
        sheet.column('AB').width(2.5);
        sheet.column('AC').width(3.3);
        sheet.column('AD').width(1.2);
        sheet.column('AE').width(3.7);
        sheet.column('AF').width(4.3);
        sheet.column('AG').width(0.4);
        sheet.column('AH').width(0.1);

        sheet.row(1).height(7.2);
        sheet.row(4).height(1.2);
        sheet.row(5).height(7.8);
        sheet.row(6).height(18);
        sheet.row(8).height(6.6);
        sheet.row(9).height(3);
        sheet.row(10).height(7.2);
        sheet.row(11).height(1.2);
        sheet.row(12).height(4.2);
        sheet.row(13).height(3);
        sheet.row(14).height(9.6);
        sheet.row(15).height(1.2);
        sheet.row(16).height(4.8);
        sheet.row(19).height(9);
        sheet.row(20).height(18);
        sheet.row(21+finalData.length).height(6.6);
        sheet.row(22+finalData.length).height(6.6);
        sheet.row(23+finalData.length).height(7.2);
        sheet.row(24+finalData.length).height(7.8);
        sheet.row(25+finalData.length).height(0.6);
        sheet.row(26+finalData.length).height(1.2);
        sheet.row(28+finalData.length).height(26.4);


        const schollName = sheet.range("A2:O2").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        })
        schollName.value("TRƯỜNG ĐẠI HỌC SPKT TP.HCM");

        const pdt = sheet.range("A3:N3").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          underline: (cell, ri, ci, range) => true,
          wrapText: true
        })
        pdt.value("PHÒNG ĐÀO TẠO");

        const title = sheet.range("A6:AI6").merged(true).style({
          bold: true,
          fontSize: 14,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        })
        title.value("DANH SÁCH SINH VIÊN DỰ THI");

        const title2 = sheet.range("A7:AI7").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        })
        title2.value(`Học kỳ 0${info.term} - Năm học ${info.year.from}-${info.year.to}`);

        const subject = sheet.range("C10:D13").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subject.value(`Môn học: `);
        const subjectId = sheet.range("C14:D16").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subjectId.value(`Mã Môn học: `);

        const subjectGroup = sheet.range("C17:D17").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subjectGroup.value(`Nhóm thi: `);

        const examDate = sheet.range("C18:D18").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        examDate.value(`Nhóm thi: `);

        const subjectValue = sheet.range("E10:S13").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subjectValue.value(`${info.subject_name} - Số Tín Chỉ: ${info.subject_credit}`);
        const subjectIdValue = sheet.range("E14:S16").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subjectIdValue.value(`${info.subject_id}`);

        const subjectGroupValue = sheet.range("E17:W17").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        subjectGroupValue.value(`Tổ 1 - AnhVan_DHCQ`);

        const examDateValue = sheet.range("E18:W18").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        examDateValue.value(`${formatDate(info.start_time)} - Giờ Thi: ${formatHour(info.start_time)}  -   phút - Số Tiết 2 - Phòng thi: ${info.room_name}`);

        const inpector = sheet.range("T9:X12").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        inpector.value(`Cán bộ coi thi 1:`);

        const line1 = sheet.range("Y9:AI12").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          underline: (cell, ri, ci, range) => true,
          wrapText: true
        })
        line1.value("                                                                             ");

        const inpector2 = sheet.range("T14:X16").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        inpector2.value(`Cán bộ coi thi 2:`);

        const line2 = sheet.range("Y14:AI16").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          underline: (cell, ri, ci, range) => true,
          wrapText: true
        })
        line2.value("                                                                             ");

        sheet.range("B20:C20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("STT");
        sheet.range("D20:E20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Mã SV");
        sheet.range("F20:M20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Họ và tên");
        sheet.range("N20:Q20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Ngày sinh");
        sheet.cell("R20").style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Số tờ");
        sheet.range("S20:T20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Điểm số");
        sheet.range("U20:Y20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Điểm chữ");
        sheet.range("Z20:AC20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Chữ ký");
        sheet.range("AD20:AH20").merged(true).style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Tên lớp");
        sheet.cell("AI20").style({
          border: true,
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        }).value("Điểm danh");
        

        for(let i=1; i<finalData.length; ++i){
          sheet.range(`B${i+20}:C${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].B);
          sheet.range(`D${i+20}:E${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].C);
          sheet.range(`F${i+20}:K${i+20}`).merged(true).style({
            border: true,
            rightBorder: false,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            wrapText: true
          }).value(finalData[i].D);
          sheet.range(`L${i+20}:M${i+20}`).merged(true).style({
            border: true,
            leftBorder: false,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            wrapText: true
          }).value(finalData[i].E);
          sheet.range(`N${i+20}:Q${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].F);
          sheet.cell(`R${i+20}`).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].G);
          sheet.range(`S${i+20}:T${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].H);
          sheet.range(`U${i+20}:Y${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].I);
          sheet.range(`Z${i+20}:AC${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].J);
          sheet.range(`AD${i+20}:AH${i+20}`).merged(true).style({
            border: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].K);

          sheet.cell(`AI${i+20}`).style({
            border: true,
            fill: finalData[i].L === "Vắng thi" ? (
              {type: "solid",
              color: {
                  rgb: "ffff00"
              }
            }) : ({type: "solid", color: {
              rgb: "FFFFFF"
            }}),
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true
          }).value(finalData[i].L);
        }

        const studentTotal = sheet.range(`C${23+finalData.length}:G${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        })
        studentTotal.value("Sinh viên trong danh sách");

        const studentTotalValue = sheet.range(`H${23+finalData.length}:H${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true
        })
        studentTotalValue.value(finalData.length - 1);

        const studentTotalAttend = sheet.range(`I${22+finalData.length}:L${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true
        })
        studentTotalAttend.value(".Số S/V Dự Thi:");

        const studentTotalAttendValue = sheet.range(`M${22+finalData.length}:P${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
          underline: (cell, ri, ci, range) => true,
        })
        studentTotalAttendValue.value(`   ${countObjectsWithAttendanceTrue(finalData)}   `);

        const date = sheet.range(`X${23+finalData.length}:Z${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        })
        date.value("Ngày");
        const month = sheet.range(`AB${23+finalData.length}:AD${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        })
        month.value("tháng");
        const year = sheet.range(`AF${23+finalData.length}:AH${25+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        })
        year.value("năm");
        const signSubject = sheet.range(`C${27+finalData.length}:J${27+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        })
        signSubject.value("Xác nhận của Bộ môn");

        const signInpector = sheet.range(`V${27+finalData.length}:AI${27+finalData.length}`).merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        })
        signInpector.value("Cán bộ chấm thi");
      });
      return workbook.outputAsync().then((workbookBlob) => URL.createObjectURL(workbookBlob));
    });
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
      if(videoRef?.current){
        await clear();
      }
      imageRef.current = null;
      setIsDropping(false);
      setModalAttendance(!modalAttendance);
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
    const nextCameraId = currentCameraIndex == 0 ? 'user' : "environment";
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
        const studentName = await faceMatcher
        .findBestMatch(detection.descriptor)
        .toString();
        const student = students.find(s => s.student.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label)
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: student ? ( student.attendance ? "Đã điểm danh" : studentName) : "unknown",
        });
        if ( student && !student.attendance &&
          faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
        ) {
          await updateAttendanceTrue(student.student.student_id);
          setSnackBarNotif({
            severity: "success",
            message:
              "Điểm danh thành công " +
              faceMatcher.findBestMatch(detection.descriptor)._label,
          });
          setSnackBarOpen(true);
          videoRef.current.pause();
          // Sau 3 giây tắt video
          setTimeout(() => {
            if(videoRef?.current)
              videoRef?.current.play();
          }, 3000);
        }
        drawBox.draw(canvasRef.current);
      }
      setIsAttending(false);
    }
  },[students]);

  useEffect(() => {
    if (videoRef?.current) {
      isLoadCanvasRef.current = true;
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
  const [isAttending, setIsAttending] = useState(false);
  const fileInputAttendRef = useRef(null);
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
    setIsDropping(true); 
    const files = event.dataTransfer.files;
    const newImages = [];

    for (const file of files) {
      if (notValidFile(file)) {
        setSnackBarNotif({
          severity: "error",
          message: "Chọn file không đúng định dạng",
        });
        setSnackBarOpen(true);
        continue;
      }
      const image = await faceapi.bufferToImage(file);
      newImages.push(image);
    }
    setImages(newImages);
  }

  function selectAttendFiles() { 
    fileInputAttendRef.current.click();
  }

  const onFileSelect = async (event) => {
    setIsDropping(true);

    const newImages = [];
    const files = event.target.files;
    for (const file of files) {
      if (notValidFile(file)) {
        setSnackBarNotif({
          severity: "error",
          message: "Chọn file không đúng định dạng",
        });
        setSnackBarOpen(true);
        continue;
      }

      const image = await faceapi.bufferToImage(file);
      newImages.push(image);
    } 
    setImages(newImages);
  };

  const [attended, setAttended] = useState();
  const doneAttended = useRef()

  useEffect(() => {
    const detectImage = async () => {
      setIsAttending(true);
      doneAttended.current = false;
      if(images.length > 0){
        for(let i = 0; i< images.length; ++i){
          const container = document.querySelector(`#imgDiv${i}`);
          const image = images[i];
          const canvas = faceapi.createCanvasFromMedia(image);
          if(container){
            container.innerHTML = '';
            container.append(images[i]);
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
              const student = students.find(s => s?.student?.student_id.toString().trim() === faceMatcher.findBestMatch(detection.descriptor)._label)
              const drawBox = new faceapi.draw.DrawBox(box, {
                label: student ? ( student.attendance ? "Đã điểm danh" : studentName) : "unknown",
              });
              if ( student && !student.attendance
                && faceMatcher.findBestMatch(detection.descriptor)._label != "unknown"
              ) {
                // const promise = updateAttendanceTrue(student.student.student_id).then(() => {
                  setAttended(student.student.student_id);
                  setSnackBarNotif({
                    severity: "success",
                    message: `Điểm danh thành công ${faceMatcher.findBestMatch(detection.descriptor)._label}`,
                  });
                  setSnackBarOpen(true);
                // });
                // promises.push(promise);
                
              }
              drawBox.draw(canvas);
            }
          }
        }
        doneAttended.current=true;
        setIsAttending(false);
      }
    }
    detectImage();
    
  },[images])

  const updateAttend = () =>{
    updateAttendanceTrue(attended);
    setAttended("");
  }
  useEffect(() => {
    if(attended){
      updateAttend();
    }
  },[attended])

  return (
    <div className={cx("homepage")}>
      <div className={cx("homepage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("homepage__timeline")}>
        <div className={cx("page_content")} style={{ marginTop: 20 }}>
          <div
            style={{
              position: "absolute",
              right: "5%",
              top: "40px",
            }}
          >
            <div style={{
              display: "flex",
              marginBottom: 10
            }}>
              <div onClick={toggleModalAttendance} style={{backgroundColor: "#0095f6",
                padding: "10px",
                color: "white",
                borderRadius: "10px",
                cursor: "pointer", marginRight: 10}}>Điểm danh</div>

              <div onClick={toggleModal} style={{backgroundColor: "#0095f6",
                padding: "10px",
                color: "white",
                borderRadius: "10px",
                cursor: "pointer",}}>Báo cáo {report.length > 0 && `(${report.length})`}</div>
            </div>
            <div onClick={printHandle} style={{backgroundColor: "#0095f6",
                padding: "10px",
                color: "white",
                borderRadius: "10px",
                cursor: "pointer", textAlign: "center"}}>Xuất file excel</div>
          </div>
          <div className={cx("all-title")}>
            <div>
              <KeyboardBackspaceIcon style={{ marginRight: 20, width: 30, height: 30}} onClick={()=> navigate(-1)}/>
            </div>
            <div className={cx("title")}>
              <h6 className={cx("text")}>{roomName}</h6>
            </div>
          </div>
          <div style={{display: "flex", justifyContent:"center", marginTop: 20 }}>
            <span style={{fontFamily: "Tahoma",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#0051C6",
            }}>
              Môn thi: {info.subject_name}, Ngày thi: {formatDate(info.start_time)}, Số lượng: {info.quantity}
            </span>
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
            <div className={cx("modal-main")} style={{flexDirection: "column", padding: "0px 0 30px 0px"}}>
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
                  videoRef?.current !== null &&
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
                  if(videoRef.current !== null){
                    await clear();
                  }
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
                  playsInline 
                  style={{ borderRadius: cameraIds.length > 1 ? "2% 2% 0 0" : "2% 2% 2% 2%" }}
                  className={cx("video")}
                ></video>
              </div>
              {cameraIds.length > 1 &&
              <div onClick={switchCamera} className={cx("switch-video")} style={{padding: "15px 0", display: "flex", justifyContent: "center", backgroundColor: "rgb(173 173 173)", borderRadius: "0px 0 10px 10px", cursor: "pointer"}}><CameraswitchIcon style={{color: "#00558d"}}/></div>}
              <canvas
                ref={canvasRef}
                width={videoRef?.current && videoRef?.current.offsetWidth}
                height={videoRef?.current && videoRef?.current.height}
                className={cx("appcanvas")}
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
                          display: !isAttending ? "flex" : "none",
                          minHeight: "420px",
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <div className={cx("image-slider-container")}>
                          <Slider ref={sliderRef}  {...settings}>
                            {images.map((image, index) => (
                              <div
                                id={`imgDiv${index}`}
                                className={cx("image-slider")}
                                key={index}
                                style={{ display: "flex !important", justifyContent: "center", alignItems: "center" }}
                              ></div>
                            ))}
                          </Slider>
                        </div>
                        <div
                          style={{
                            display: isAttending ? "block" : "none",
                            position: "absolute",
                            zIndex: 5,
                            width: "100%",
                            height: "80%",
                            backgroundColor: "white",
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
                  </div>
                  {!isAttending && 
                  <div className={cx("modal-input")} style={{marginTop: 0}}>
                    <input
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                      multiple
                      ref={fileInputAttendRef}
                      onChange={onFileSelect}
                      id="myFileInput"
                      style={{ display: "none" }}
                    />
                    <label
                      style={{marginBottom: 0}}
                      role="button"
                      onClick={selectAttendFiles}
                      className={cx("modal-upload")}
                    >
                      Select from device
                    </label>
                  </div>}
                </div>
              ) : (
                <div className={cx("content")} style={{display: "flex", backgroundColor: isDragging && "#0094f61b"}}>
                  <div
                    style={{height: "auto"}}
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
                          ref={fileInputAttendRef}
                          onChange={onFileSelect}
                          id="myFileInput"
                          style={{ display: "none" }}
                        />
                        <label
                          role="button"
                          onClick={selectAttendFiles}
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
    </div>
  );
}

export default HomePage;
