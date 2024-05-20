import { React, useCallback, useEffect, useRef, useState } from "react";
// import { subDays, subHours } from "date-fns";
import VerticalAlignTopOutlinedIcon from "@mui/icons-material/VerticalAlignTopOutlined";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { StudentsSearch } from "./StudentsSearch";
import { AdminTable } from "../Common/AdminTable/Table";
// import { applyPagination } from "../../../../shared/util/apply-pagination";
// import { useSelection } from "../../../../shared/hook/use-selection";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames/bind";
import styles from "../UsersManager/UserModal.module.scss";
import styles2 from "../../../Supervisor/StudentCard/StudentCard.module.scss";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import ImportInput from "../UploadFile/ImportInput";
import { getStudentsImageSource } from "../../../../untils/getImageSource";
import { formatDate } from "../../../../untils/format-date";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
// const now = new Date();

const StudentsManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const {
    uploadImportFile,
    getAdminStudents,
    banUsers,
    unBanUsers,
    createUser,
    uploadImagesImportFile,
  } = useAdminServices();

  const [visible, setVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);

  const [usersSelected, setUsersSelected] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
    admin: true,
  });

  const [file, setFile] = useState();
  const [fileIsValid, setFileIsValid] = useState();

  const removeFile = () => {
    setFile(null);
    setFileIsValid(false);
  };

  const uploadImportStudentsFileHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadImportFile(formData);
      if (response) {
        removeFile();
      }
    } catch (err) {
      console.log("upload file: ", err);
    }
  };

  const uploadImportImagesFileHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadImagesImportFile(formData);
      if (response) {
        removeFile();
      }
    } catch (err) {
      console.log("upload file: ", err);
    }
  };

  const changeHandler = (e) => {
    setModalData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const learningStatus = {
    LEARNING: "Còn học",
    PAUSE: "Tạm hoãn",
    STOPPED: "Dừng học",
    GRADUATED: "Đã tốt nghiệp",
  };

  const getData = useCallback(async () => {
    const response = await getAdminStudents(page, rowsPerPage, search);
    if (response) {
      setData(
        response.students.map((student) => {
          return {
            ...student,
            gender: student.gender ? "Nam" : "Nữ",
            fullname: `${student.last_name} ${student.middle_name} ${student.first_name}`,
            student_type:
              student.student_type === "FORMAL"
                ? "Chính quy"
                : "Không xác định",
            learning_status: learningStatus[student.learning_status],
          };
        })
      );
      setTotalRecord(response.total_students);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    getData();
  }, [page, rowsPerPage, search]);

  // useEffect(() => {}, [data]);

  const handleBanUsers = async () => {
    const selectedIds = [...usersSelected]; // Sao chép usersSelected vào một mảng tạm thời
    setUsersSelected([]);

    setData((prev) => []);

    try {
      const banPromises = selectedIds.map((id) =>
        banUsers(id, privateHttpRequest.privateRequest)
      );

      const responses = await Promise.all(banPromises);

      if (responses) await getData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnBanUsers = async () => {
    const selectedIds = [...usersSelected]; // Sao chép usersSelected vào một mảng tạm thời

    setUsersSelected([]);

    setData((prev) => []);

    try {
      const unBanPromises = selectedIds.map((id) =>
        unBanUsers(id, privateHttpRequest.privateRequest)
      );

      const responses = await Promise.all(unBanPromises);

      if (responses) await getData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async () => {
    privateHttpRequest.clearError();
    try {
      const response = await createUser(
        modalData,
        privateHttpRequest.privateRequest
      );

      if (response) {
        setVisible(false);
        setModalData({
          email: "",
          fullname: "",
          username: "",
          password: "",
          admin: true,
        });
        getData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = useCallback((event, value) => {
    setPage(value + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const handleEdit = async () => {};

  const handleEditClick = () => {
    setIsEdit(!isEdit);
  };

  const renderModalBody = (item, toggleModal) => {
    return (
      <div
        className={cx2("modal-navbar-content")}
        style={{ width: "50%", marginTop: 30 }}
      >
        <div className={cx2("modal-header")}>Thông tin sinh viên</div>
        <div className={cx2("modal-main")}>
          <div style={{ height: "250px" }}>
            <img
              style={{ width: "100%", maxHeight: "250px" }}
              src={getStudentsImageSource(item.portrait_img)}
            />
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>MSSV:</div>
            <input
              className={cx2("input-span", !isEdit && "input-span-focus")}
              value={item.student_id}
              readOnly={!isEdit}
              disabled={!isEdit}
            />
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Họ và tên:</div>
            <input
              className={cx2("input-span", !isEdit && "input-span-focus")}
              value={item.fullname}
              readOnly={!isEdit}
            />
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>CMND/CCCD:</div>
            <span className={cx2("span")}>
              {item.citizen_identification_number}
            </span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Giới tính:</div>
            <span className={cx2("span")}>{item.gender}</span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Ngày sinh:</div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    inputProps: {
                      style: { padding: 0 },
                    },
                    sx: {
                      p: 0,
                      width: 150,
                    },
                    variant: "standard",
                  },
                }}
                value={dayjs(formatDate(item.date_of_birth))}
                disabled={!isEdit}
              />
            </LocalizationProvider>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Nơi sinh:</div>
            <span className={cx2("span")}>{item.place_of_birth}</span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Tỉnh/TP:</div>
            <span className={cx2("span")}>
              {item.permanent_address.city_or_province}
            </span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Quận/huyện:</div>
            <span className={cx2("span")}>
              {item.permanent_address.district}
            </span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Địa chỉ thường trú:</div>
            <span className={cx2("span")}>
              {item.permanent_address.address}
            </span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Quốc tịch:</div>
            <span className={cx2("span")}>{item.nationality}</span>
          </div>
          <div className={cx2("info")}>
            <div className={cx2("title")}>Lớp học phần:</div>
            <span className={cx2("span")}>{item.class}</span>
          </div>
          <div
            style={{
              width: "80%",
              marginTop: 15,
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              className={cx2("button")}
              style={{
                backgroundColor: "lightpink",
              }}
              onClick={isEdit ? handleEditClick : toggleModal}
            >
              {isEdit ? "Hủy" : "Đóng"}
            </button>
            <button
              className={cx2("button")}
              style={{
                backgroundColor: "lightgreen",
              }}
              onClick={isEdit ? handleEdit : handleEditClick}
            >
              {isEdit ? "Lưu" : "Chỉnh sửa"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Students</Typography>
                <ImportInput
                  file={file}
                  fileIsValid={fileIsValid}
                  setFile={setFile}
                  setFileIsValid={setFileIsValid}
                  removeFile={removeFile}
                  uploadType={[
                    {
                      name: "Students",
                      acceptFile:
                        ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
                      uploadHandler: uploadImportStudentsFileHandler,
                    },
                    {
                      name: "Images",
                      acceptFile: ".zip,.rar",
                      uploadHandler: uploadImportImagesFileHandler,
                    },
                  ]}
                />
              </Stack>

              <div>
                {usersSelected.length > 0 && (
                  <>
                    <Button
                      onClick={handleUnBanUsers}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <RemoveCircleOutlineIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      sx={{
                        background: "green",
                        marginRight: 5,
                        ":hover": { background: "green", opacity: 0.7 },
                      }}
                    >
                      UnBan
                    </Button>

                    <Button
                      onClick={handleBanUsers}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <BlockIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      sx={{
                        background: "red",
                        marginRight: 5,
                        ":hover": { background: "red", opacity: 0.7 },
                      }}
                    >
                      Ban
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => setVisible(true)}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <AddIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  disabled={privateHttpRequest.isLoading}
                >
                  Add
                </Button>
              </div>
            </Stack>
            <StudentsSearch setSearch={setSearch} />
            {!privateHttpRequest.isLoading && (
              <AdminTable
                count={totalRecord}
                data={data}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                setItemsSelected={setUsersSelected}
                selected={usersSelected}
                colsName={["MSSV", "Họ tên", "Hệ", "Giới tính", "Tình trạng"]}
                colsData={[
                  "student_id",
                  "fullname",
                  "student_type",
                  "gender",
                  "learning_status",
                ]}
                renderModalBody={renderModalBody}
              />
            )}
          </Stack>
        </Container>
        <Modal
          show={visible}
          onHide={() => setVisible(false)}
          className={cx("add-employee-modal")}
        >
          <Modal.Header>
            <div className={cx("title-modal")}>ADD STUDENT</div>
            {privateHttpRequest.error && (
              <>
                <br />
                <div className={cx("title-modal")}>
                  {" "}
                  <Alert severity="error">{privateHttpRequest.error}</Alert>
                </div>
              </>
            )}
          </Modal.Header>
          <Modal.Body>
            <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>First Name</div>
                </div>
                <input
                  id="firstname"
                  type="text"
                  onChange={changeHandler}
                  className={cx("col-lg-8 col-md-8")}
                />
              </div>
            </div>
            <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>Email</div>
                </div>
                <input
                  id="email"
                  type="email"
                  onChange={changeHandler}
                  className={cx("col-lg-9 col-md-9")}
                />
              </div>
            </div>
            <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>Fullname</div>
                </div>
                <input
                  id="fullname"
                  type="text"
                  onChange={changeHandler}
                  className={cx("col-lg-9 col-md-9")}
                />
              </div>
            </div>
            <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>Password</div>
                </div>
                <input
                  id="password"
                  type="password"
                  onChange={changeHandler}
                  className={cx("col-lg-9 col-md-9")}
                />
              </div>
            </div>
            {/* <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>Date of birth</div>
                </div>
                <input
                  type="date"
                  // onChange={(e) => setDateOfbirth(e.target.value)}
                  className={cx("col-lg-9 col-md-9")}
                />
              </div>
            </div>
            <div className={cx("row align-items-center", "modal-content-item")}>
              <div>
                <div className={cx("col-lg-3 col-md-3", "heading-modal")}>
                  <div>Gender</div>
                </div>
                <span className={cx("gender")}>
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    style={{ width: "auto", margin: "10px 10px 0px 20px" }}
                    // onChange={(e) => setGender(e.target.value)}
                  />
                  <label for="male">Male</label>
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    style={{ width: "auto", margin: "10px 10px 0px 20px" }}
                    // onChange={(e) => setGender(e.target.value)}
                  />
                  <label for="female">Female</label>
                </span>
              </div>
            </div> */}
          </Modal.Body>
          <Modal.Footer>
            <div
              style={{
                width: "70%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                className={cx("modal-button")}
                style={{
                  backgroundColor: "#ff0000",
                  border: "none",
                  color: "white",
                  borderRadius: "10px",
                }}
                onClick={() => setVisible(false)}
              >
                CLOSE
              </button>
              <button
                className={cx("modal-button")}
                style={{
                  backgroundColor: "#1976d2",
                  border: "none",
                  color: "white",
                  borderRadius: "10px",
                }}
                onClick={handleAddUser}
              >
                ADD
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </Box>
    </>
  );
};

export default StudentsManage;
