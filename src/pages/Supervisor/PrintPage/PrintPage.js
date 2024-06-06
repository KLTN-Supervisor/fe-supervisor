import * as React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useReactToPrint } from "react-to-print";
import useExamScheduleServices from "../../../services/useExamScheduleServices";
import { formatHour } from "../../../untils/format-date";
function PrintPage() {
  const navigate = useNavigate();
  const time = new URLSearchParams(window.location.search).get("time");
  const room = new URLSearchParams(window.location.search).get("room");
  const { getStudents, getRoomInfo } = useExamScheduleServices();
  const [students, setStudents] = React.useState([]);
  const [info, setInfo] = React.useState({});
  const [studentsLoading, setStudentsLoading] = React.useState(false);
  const getStudentsExam = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getStudents(time, room);
        setStudents(response);
        setStudentsLoading(false);
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

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "#507CD1;",
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "#EFF3FB",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 1,
    },
  }));
  const componentRef = React.useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "data",
    onAfterPrint: () => navigate("/"),
  });

  React.useEffect(() => {
    getInfo();
    getStudentsExam();
  }, [time, room]);

  React.useEffect(() => {
    if (students.length > 0) handlePrint();
  }, [students]);
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 900 }} ref={componentRef}>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <span
            style={{
              fontFamily: "Tahoma",
              fontSize: "20px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            PHÒNG THI
          </span>
        </div>

        <div style={{ marginLeft: 40, marginBottom: 10 }}>
          <span>Môn thi: </span>
          <span style={{ fontWeight: "bold" }}>{info.subject_name}</span>
        </div>
        <div style={{ marginLeft: 40 }}>
          <span>Phòng thi: </span>
          <span style={{ fontWeight: "bold", marginRight: 20 }}>
            {info.room_name}
          </span>
          <span>Ca thi: </span>
          <span style={{ fontWeight: "bold" }}>
            {formatHour(info.start_time)}
          </span>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <span
            style={{
              fontFamily: "Tahoma",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#0051C6",
            }}
          >
            DANH SÁCH PHÒNG THI
          </span>
        </div>
        <div>
          <span
            style={{
              fontFamily: "Tahoma",
              fontSize: "11px",
              fontWeight: "bold",
              marginLeft: 50,
              color: "#0051C6",
            }}
          >
            HK0{info.term}/{info.year?.from}-{info.year?.to}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TableContainer component={Paper} sx={{ width: 0.9 }}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>MSSV</StyledTableCell>
                  <StyledTableCell align="right">Họ và tên</StyledTableCell>
                  <StyledTableCell align="right">Điểm danh</StyledTableCell>
                  {/* <StyledTableCell align="right">Carbs&nbsp;(g)</StyledTableCell>
                  <StyledTableCell align="right">Protein&nbsp;(g)</StyledTableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <StyledTableRow key={student.student.student_id}>
                    <StyledTableCell component="th" scope="row">
                      {student.student.student_id}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {student.student.last_name +
                        " " +
                        student.student.middle_name +
                        " " +
                        student.student.first_name}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {student.attendance ? "Có mặt" : "Vắng thi"}
                    </StyledTableCell>
                    {/* <StyledTableCell align="right">{row.carbs}</StyledTableCell>
                    <StyledTableCell align="right">{row.protein}</StyledTableCell> */}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
}
export default PrintPage;
