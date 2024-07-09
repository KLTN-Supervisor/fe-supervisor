import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./StudentSearchingPage.module.scss";
import Sidenav from "../../../components/Sidenav";
import SearchIcon from "@mui/icons-material/Search";
import StudentCard from "../../../components/Supervisor/StudentCard";
import LoadingCard from "../../../components/LoadingCard";
import useStudentServices from "../../../services/useStudentServices";
import { Alert, Snackbar, CircularProgress } from "@mui/material";

const cx = classNames.bind(styles);

function RoomingListPage() {
  const searchRef = useRef();
  const scrollRef = useRef(null);
  const [loadMore, setLoadMore] = useState(false);
  const [loadDone, setLoadDone] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarNotif, setSnackBarNotif] = useState({
    severity: "success",
    message: "This is success message!",
  }); //severity: success, error, info, warning


  const { getStudentsPaginated, searchStudents } = useStudentServices();

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [page, setPage] = useState(1);

  


  const getStudents = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getStudentsPaginated(page, 20);

        setStudents(response.students);
        setStudentsLoading(false);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get students error: ", err);
      }
    }
  };

  const handleSearch = async () => {
    if (!studentsLoading && searchRef.current.value != "") {
      setStudentsLoading(true);
      setLoadDone(false);
      try {
        const response = await searchStudents(
          0,
          searchRef.current.value,
        );
        setStudents(response);
      } catch (err) {
        console.log("get students error: ", err);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    }
  };

  const handleEnter = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của phím Enter (như xuống dòng)
      if (!studentsLoading && searchRef.current.value != "") {
        setStudentsLoading(true);
        setLoadDone(false);
        try {
          const response = await searchStudents(
            0,
            searchRef.current.value,
          );
          setStudents(response);  
        } catch (err) {
          console.log("get students error: ", err);
          setStudents([]);
        } finally {
          setStudentsLoading(false);
        }
      }
    }
  };


  const addNewStudents = (newStudents) => {
    setStudents((prev) => {
      // Create a Set of student_id values from the previous state
      const existingStudentIds = new Set(prev.map((student) => student.student_id));

      // Filter out the new students with duplicate student_id values
      const uniqueNewStudents = newStudents.filter(
        (newStudent) => !existingStudentIds.has(newStudent.student_id)
      );

      // Combine the previous students and the unique new students
      return [...prev, ...uniqueNewStudents];
    });
  };

  useEffect(() => {
    const handleScroll = async () => {
      const scrollHeight = document.body.scrollHeight;
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
    
      if (
        scrollPosition + viewportHeight + 0.81 >= scrollHeight &&
        searchRef.current.value &&
        !loadMore &&
        !loadDone
      ) {
        setLoadMore(true);
        try {
          const response = await searchStudents(
            students?.length,
            searchRef.current.value
          );
    
          if (response) {
            if (response.length < 16) {
              setLoadDone(true);
              addNewStudents(response)
            } else if (response.length > 0) {
              addNewStudents(response)
            } else{
              setLoadDone(true);
            }
            
          }
        } catch (error) {
          console.log("Lỗi:", error);
        } finally {
          setLoadMore(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [students, searchRef.current]);

  useEffect(() => {
    document.title = "Tra cứu sinh viên";
    getStudents();
  }, []);



  return (
    <div className={cx("studentPage")}>
      <div className={cx("studentPage__navWraper")}>
        <Sidenav />
      </div>
      <div className={cx("studentPage__content")}>
        <h1>
          TRA CỨU SINH VIÊN
        </h1>
        <div className={cx("page_content")}>
          <div className={cx("page_content__header")}>
            <div className={cx("search")}>
              <input type="text" placeholder="Search" ref={searchRef} onKeyUp={handleEnter}/>
              <button
                className={cx("search__button")}
                style={{
                  display: "flex",
                  padding: 10,
                  marginLeft: 30,
                }}
                onClick={handleSearch}
              >
                <SearchIcon
                  className={cx("search__icon")}
                  style={{ width: "24px", height: "24px", fontWeight: "900" }}
                />
              </button>
            </div>
          </div>
          <div className={cx("page_content__body")}>
            <div className={cx("students")} > 
              {studentsLoading ? (
                <LoadingCard />
              ) : students?.length > 0 ? (
                students.map((student, i) => (
                  <StudentCard key={i} student={student} search={true}/>
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
                  Không tìm thấy kết quả
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

export default RoomingListPage;
