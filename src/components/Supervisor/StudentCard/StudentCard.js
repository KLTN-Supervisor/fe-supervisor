import CloseIcon from "@mui/icons-material/Close";
import classNames from "classnames/bind";
import dayjs from "dayjs";
import React, { useState } from "react";
import styles from "./StudentCard.module.scss";
import { formatDate } from "../../../untils/format-date";
const cx = classNames.bind(styles);
function StudentCard({ student, attendance }) {
  const [age, setAge] = useState("");
  const [value, setValue] = React.useState(dayjs("2022-04-17T15:30"));
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
    console.log(attendance === undefined);
  };

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <>
      <div className={cx("student")} onClick={toggleModal}>
        <div style={{ height: "235px" }}>
          <img
            style={{ width: "100%", maxHeight: "235px" }}
            src={student.portrait_img}
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
        {attendance !== undefined && attendance === false && <span
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
        </span>}
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
            <div className={cx("modal-header")}>Thông tin sinh viên</div>
            <div className={cx("modal-main")}>
              <div style={{ height: "250px" }}>
                <img
                  style={{ width: "100%", maxHeight: "250px" }}
                  src={student.portrait_img}
                />
              </div>
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
                <span className={cx("span")}>{formatDate(student.date_of_birth)}</span>
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
      )}
    </>
  );
}
export default StudentCard;
