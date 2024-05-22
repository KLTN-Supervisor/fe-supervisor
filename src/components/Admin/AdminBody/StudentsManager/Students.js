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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import UploadInput from "../UploadFile/UploadInput";
import CloseIcon from "@mui/icons-material/Close";

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
    student_id: "",
    fullname: "",
    citizen_identification_number: "",
    gender: "",
    date_of_birth: "",
    place_of_birth: "",
    city_or_province: "",
    district: "",
    address: "",
    nationality: "",
    class: "",
  });

  const clearModalData = () => {
    setModalData({
      student_id: "",
      fullname: "",
      citizen_identification_number: "",
      gender: "",
      date_of_birth: "",
      place_of_birth: "",
      city_or_province: "",
      district: "",
      address: "",
      nationality: "",
      class: "",
    });
  };

  const [file, setFile] = useState();
  const [fileIsValid, setFileIsValid] = useState();

  const [files, setFiles] = useState();
  const [filesIsValid, setFilesIsValid] = useState();

  const removeFile = () => {
    setFile(null);
    setFileIsValid(false);
  };

  const removeArchiveFiles = () => {
    setFiles([]);
    setFilesIsValid(false);
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
    console.log(e.target.id);
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
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const imgRef = useRef();
  const [portraitImgFile, setPortraitImgFile] = useState();
  const [previewPortraitImg, setPreviewPortraitImg] = useState();

  const pickImgFileHandler = (e) => {
    let pickedFile;

    if (e.target.files) {
      pickedFile = e.target.files[0];
      setPortraitImgFile(pickedFile);
    }
  };

  const clearPortrailImg = () => {
    setPortraitImgFile(null);
    setPreviewPortraitImg(null);
    imgRef.current.value = null;
  };

  useEffect(() => {
    if (!portraitImgFile) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewPortraitImg(fileReader.result);
    };
    fileReader.readAsDataURL(portraitImgFile);
  }, [portraitImgFile]);

  const [isCreateNew, setIsCreateNew] = useState(false);

  const [modal, setModal] = useState(false);
  const [modalViewStudent, setModalViewStudent] = useState(null);
  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (!isCreateNew) {
      setPreviewPortraitImg(modalViewStudent?.portrait_img);
      setModalData({
        student_id: modalViewStudent?.student_id,
        fullname: modalViewStudent?.fullname,
        citizen_identification_number:
          modalViewStudent?.citizen_identification_number,
        gender: modalViewStudent?.gender,
        date_of_birth: modalViewStudent?.date_of_birth,
        place_of_birth: modalViewStudent?.place_of_birth,
        city_or_province: modalViewStudent?.permanent_address.city_or_province,
        district: modalViewStudent?.permanent_address.district,
        address: modalViewStudent?.permanent_address.address,
        nationality: modalViewStudent?.nationality,
        class: modalViewStudent?.class,
      });
    }
  }, [modalViewStudent]);

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
                <Typography variant="h4">Sinh viên</Typography>
                <ImportInput
                  file={file}
                  fileIsValid={fileIsValid}
                  setFile={setFile}
                  setFileIsValid={setFileIsValid}
                  removeFile={removeFile}
                  uploadHandler={uploadImportStudentsFileHandler}
                  buttonName="Import sinh viên"
                />
                <UploadInput
                  files={files}
                  fileIsValid={filesIsValid}
                  setFiles={setFiles}
                  setFileIsValid={setFilesIsValid}
                  removeFile={removeArchiveFiles}
                  buttonName="Tải lên hình ảnh"
                  acceptFile=".zip,.rar"
                  uploadHandler={uploadImportImagesFileHandler}
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
                onClickItem={(item) => {
                  setModalViewStudent(item);
                  toggleModal();
                }}
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
      {modal && (
        <div className={cx2("modal active-modal")}>
          <div
            onClick={toggleModal}
            className={cx2("overlay")}
            style={{ alignSelf: "flex-end" }}
          >
            <CloseIcon
              //className={cx("sidenav__icon")}
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
          <div
            className={cx2("modal-navbar-content")}
            style={{ width: "80%", marginTop: 30 }}
          >
            <div className={cx2("modal-header")}>Thông tin sinh viên</div>
            <div className={cx2("modal-main")} style={{display: "flex", padding: "20px 0 30px 0px"}}>
              <div style={{ flex: 0.2, height: "100%", display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center"}}>
                <div
                  style={{ height: "250px", cursor: isEdit ? "pointer" : "" }}
                  onClick={() => {
                    if (isEdit) imgRef.current.click();
                  }}
                >
                  <img
                    style={{ width: "100%", maxHeight: "250px" }}
                    src={getStudentsImageSource(
                      previewPortraitImg
                        ? previewPortraitImg
                        : modalViewStudent?.portrait_img
                    )}
                    alt="Ảnh thẻ sinh viên"
                  />
                  <input
                    id="portrait_img"
                    ref={imgRef}
                    type="file"
                    hidden
                    accept=".png,.jpg,.jpeg"
                    disabled={!isEdit}
                    onChange={pickImgFileHandler}
                  />
                </div>
              </div>
              <div className={cx2("modal-info")}>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>MSSV:</div>
                  <input
                    id="student_id"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.student_id}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Họ và tên:</div>
                  <input
                    id="fullname"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.fullname}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>CMND/CCCD:</div>
                  <input
                    id="citizen_identification_number"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.citizen_identification_number}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Giới tính:</div>
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue="Nữ"
                      value={modalData?.gender}
                      onChange={changeHandler}
                    >
                      <FormControlLabel
                        value="Nữ"
                        control={
                          <Radio
                            id="gender"
                            size="small"
                            readOnly={!isEdit}
                            sx={{ p: 0, ml: 1.5, mr: 0.5 }}
                          />
                        }
                        label="Nữ"
                      />
                      <FormControlLabel
                        value="Nam"
                        control={
                          <Radio
                            id="gender"
                            size="small"
                            readOnly={!isEdit}
                            sx={{ p: 0, ml: 5, mr: 0.5 }}
                          />
                        }
                        label="Nam"
                      />
                    </RadioGroup>
                  </FormControl>
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
                      value={dayjs(new Date(modalData?.date_of_birth))}
                      format="DD/MM/YYYY"
                      readOnly={!isEdit}
                      onChange={(value) => {
                        setModalData((prev) => ({
                          ...prev,
                          date_of_birth: value,
                        }));
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Nơi sinh:</div>
                  <input
                    id="place_of_birth"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.place_of_birth}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Tỉnh/TP:</div>
                  <input
                    id="city_or_province"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.city_or_province}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quận/huyện:</div>
                  <input
                    id="district"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.district}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Địa chỉ thường trú:</div>
                  <input
                    id="address"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.address}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quốc tịch:</div>
                  <input
                    id="nationality"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.nationality}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Lớp học phần:</div>
                  <input
                    id="class"
                    className={cx2("input-span", !isEdit && "input-span-focus")}
                    value={modalData?.class}
                    readOnly={!isEdit}
                    onChange={changeHandler}
                  />
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
          </div>
        </div>
      )}
    </>
  );
};

export default StudentsManage;
