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
import { formatDate, formatHour, formatDateExtend, formatHourExtend, } from "../../../untils/format-date";
import * as XLSX from "xlsx";
import * as xlsxPopulate from "xlsx-populate/browser/xlsx-populate";
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


  const printHandle = () => {
    handleExport().then((url) => {
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.href = url;
      downloadAnchorNode.setAttribute(
        "download",
        `DSSVDuThi_${formatDateExtend(info.start_time)}_${formatHourExtend(
          info.start_time
        )}_${info.room_name}.xlsx`
      );
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i);
    }
    return buf;
  };

  const workbook2blob = (workbook) => {
    const wopts = {
      bookType: "xlsx",
      type: "binary",
    };

    const wbout = XLSX.write(workbook, wopts);

    const blob = new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    });

    return blob;
  };

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
    let table = [];
    for (let i = 1; i <= students.length; ++i) {
      table.push({
        B: i,
        C: students[i - 1].student.student_id,
        D:
          students[i - 1].student.last_name +
          " " +
          students[i - 1].student.middle_name,
        E: students[i - 1].student.first_name,
        F: formatDate(students[i - 1].student.date_of_birth),
        G: "",
        H: "",
        I: "",
        J: "",
        K: students[i - 1].student.class,
        L: students[i - 1].attendance ? "Có mặt" : "Vắng thi",
      });
    }
    const tableTitle = [
      {
        B: "STT",
        C: "Mã SV",
        D: "Họ và tên",
        E: "Ngày sinh",
        F: "Số tờ",
        G: "Điểm số",
        H: "Điểm chữ",
        I: "Chữ ký",
        J: "Tên lớp",
        K: "Điểm danh",
      },
    ];

    const finalData = [...tableTitle, ...table];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(finalData, {
      origin: "B20",
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, `${info.room_name}`);

    const workbookBlob = workbook2blob(workbook);

    return addStyles(workbookBlob, finalData);
  };

  const addStyles = (workbookBlob, finalData) => {
    return xlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
      workbook.sheets().forEach((sheet) => {
        sheet.gridLinesVisible(false);
        sheet.column("A").width(1.4);
        sheet.column("B").width(1.3);
        sheet.column("C").width(2.4);
        sheet.column("D").width(8.1);
        sheet.column("E").width(0.4);
        sheet.column("F").width(2.5);
        sheet.column("G").width(6.1);
        sheet.column("H").width(3.6);
        sheet.column("I").width(2.5);
        sheet.column("J").width(3.4);
        sheet.column("K").width(2.5);
        sheet.column("L").width(3.9);
        sheet.column("M").width(4.2);
        sheet.column("N").width(1);
        sheet.column("O").width(0.3);
        sheet.column("P").width(0.6);
        sheet.column("Q").width(8.7);
        sheet.column("R").width(6.1);
        sheet.column("S").width(4.3);
        sheet.column("T").width(2.4);
        sheet.column("U").width(4.9);
        sheet.column("V").width(0.1);
        sheet.column("W").width(4);
        sheet.column("X").width(0.9);
        sheet.column("Y").width(2.4);
        sheet.column("Z").width(1.5);
        sheet.column("AA").width(2.4);
        sheet.column("AB").width(2.5);
        sheet.column("AC").width(3.3);
        sheet.column("AD").width(1.2);
        sheet.column("AE").width(3.7);
        sheet.column("AF").width(4.3);
        sheet.column("AG").width(0.4);
        sheet.column("AH").width(0.1);

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
        sheet.row(21 + finalData.length).height(6.6);
        sheet.row(22 + finalData.length).height(6.6);
        sheet.row(23 + finalData.length).height(7.2);
        sheet.row(24 + finalData.length).height(7.8);
        sheet.row(25 + finalData.length).height(0.6);
        sheet.row(26 + finalData.length).height(1.2);
        sheet.row(28 + finalData.length).height(26.4);

        const schollName = sheet.range("A2:O2").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        });
        schollName.value("TRƯỜNG ĐẠI HỌC SPKT TP.HCM");

        const pdt = sheet
          .range("A3:N3")
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            underline: (cell, ri, ci, range) => true,
            wrapText: true,
          });
        pdt.value("PHÒNG ĐÀO TẠO");

        const title = sheet.range("A6:AI6").merged(true).style({
          bold: true,
          fontSize: 14,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        });
        title.value("DANH SÁCH SINH VIÊN DỰ THI");

        const title2 = sheet.range("A7:AI7").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          horizontalAlignment: "center",
          wrapText: true,
        });
        title2.value(
          `Học kỳ 0${info.term} - Năm học ${info.year.from}-${info.year.to}`
        );

        const subject = sheet.range("C10:D13").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subject.value(`Môn học: `);
        const subjectId = sheet.range("C14:D16").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subjectId.value(`Mã Môn học: `);

        const subjectGroup = sheet.range("C17:D17").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subjectGroup.value(`Nhóm thi: `);

        const examDate = sheet.range("C18:D18").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        examDate.value(`Ngày thi: `);

        const subjectValue = sheet.range("E10:S13").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subjectValue.value(
          `${info.subject_name} - Số Tín Chỉ: ${info.subject_credit}`
        );
        const subjectIdValue = sheet.range("E14:S16").merged(true).style({
          bold: true,
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subjectIdValue.value(`${info.subject_id}`);

        const subjectGroupValue = sheet.range("E17:W17").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        subjectGroupValue.value(`Tổ 1 - AnhVan_DHCQ`);

        const examDateValue = sheet.range("E18:W18").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        examDateValue.value(
          `${formatDate(info.start_time)} - Giờ Thi: ${formatHour(
            info.start_time
          )}  -   phút - Số Tiết 2 - Phòng thi: ${info.room_name}`
        );

        const inpector = sheet.range("T9:X12").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        inpector.value(`Cán bộ coi thi 1:`);

        const line1 = sheet
          .range("Y9:AI12")
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            underline: (cell, ri, ci, range) => true,
            wrapText: true,
          });
        line1.value(
          "                                                                             "
        );

        const inpector2 = sheet.range("T14:X16").merged(true).style({
          fontSize: 10,
          fontFamily: "Times New Roman",
          verticalAlignment: "center",
          wrapText: true,
        });
        inpector2.value(`Cán bộ coi thi 2:`);

        const line2 = sheet
          .range("Y14:AI16")
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            underline: (cell, ri, ci, range) => true,
            wrapText: true,
          });
        line2.value(
          "                                                                             "
        );

        sheet
          .range("B20:C20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("STT");
        sheet
          .range("D20:E20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Mã SV");
        sheet
          .range("F20:M20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Họ và tên");
        sheet
          .range("N20:Q20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Ngày sinh");
        sheet
          .cell("R20")
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Số tờ");
        sheet
          .range("S20:T20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Điểm số");
        sheet
          .range("U20:Y20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Điểm chữ");
        sheet
          .range("Z20:AC20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Chữ ký");
        sheet
          .range("AD20:AH20")
          .merged(true)
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Tên lớp");
        sheet
          .cell("AI20")
          .style({
            border: true,
            bold: true,
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          })
          .value("Điểm danh");

        for (let i = 1; i < finalData.length; ++i) {
          sheet
            .range(`B${i + 20}:C${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].B);
          sheet
            .range(`D${i + 20}:E${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].C);
          sheet
            .range(`F${i + 20}:K${i + 20}`)
            .merged(true)
            .style({
              border: true,
              rightBorder: false,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].D);
          sheet
            .range(`L${i + 20}:M${i + 20}`)
            .merged(true)
            .style({
              border: true,
              leftBorder: false,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].E);
          sheet
            .range(`N${i + 20}:Q${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].F);
          sheet
            .cell(`R${i + 20}`)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].G);
          sheet
            .range(`S${i + 20}:T${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].H);
          sheet
            .range(`U${i + 20}:Y${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].I);
          sheet
            .range(`Z${i + 20}:AC${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].J);
          sheet
            .range(`AD${i + 20}:AH${i + 20}`)
            .merged(true)
            .style({
              border: true,
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].K);

          sheet
            .cell(`AI${i + 20}`)
            .style({
              border: true,
              fill:
                finalData[i].L === "Vắng thi"
                  ? {
                      type: "solid",
                      color: {
                        rgb: "ffff00",
                      },
                    }
                  : {
                      type: "solid",
                      color: {
                        rgb: "FFFFFF",
                      },
                    },
              fontSize: 10,
              fontFamily: "Times New Roman",
              verticalAlignment: "center",
              horizontalAlignment: "center",
              wrapText: true,
            })
            .value(finalData[i].L);
        }

        const studentTotal = sheet
          .range(`C${23 + finalData.length}:G${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        studentTotal.value("Sinh viên trong danh sách");

        const studentTotalValue = sheet
          .range(`H${23 + finalData.length}:H${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        studentTotalValue.value(finalData.length - 1);

        const studentTotalAttend = sheet
          .range(`I${22 + finalData.length}:L${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            wrapText: true,
          });
        studentTotalAttend.value(".Số S/V Dự Thi:");

        const studentTotalAttendValue = sheet
          .range(`M${22 + finalData.length}:P${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            wrapText: true,
            underline: (cell, ri, ci, range) => true,
          });
        studentTotalAttendValue.value(
          `   ${countObjectsWithAttendanceTrue(finalData)}   `
        );

        const date = sheet
          .range(`X${23 + finalData.length}:Z${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        date.value("Ngày");
        const month = sheet
          .range(`AB${23 + finalData.length}:AD${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        month.value("tháng");
        const year = sheet
          .range(`AF${23 + finalData.length}:AH${25 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        year.value("năm");
        const signSubject = sheet
          .range(`C${27 + finalData.length}:J${27 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        signSubject.value("Xác nhận của Bộ môn");

        const signInpector = sheet
          .range(`V${27 + finalData.length}:AI${27 + finalData.length}`)
          .merged(true)
          .style({
            fontSize: 10,
            fontFamily: "Times New Roman",
            verticalAlignment: "center",
            horizontalAlignment: "center",
            wrapText: true,
          });
        signInpector.value("Cán bộ chấm thi");
      });
      return workbook
        .outputAsync()
        .then((workbookBlob) => URL.createObjectURL(workbookBlob));
    });
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
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <div
                      onClick={printHandle}
                      style={{
                        marginRight: "1.8%",
                        marginBottom: 10,
                        backgroundColor: "#0095f6",
                        padding: "10px",
                        color: "white",
                        borderRadius: "10px",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      Xuất danh sách
                    </div>
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
