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
import Backdrop from "@mui/material/Backdrop";
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
import { toast } from "react-toastify";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
// const now = new Date();

const StudentsManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const {
    uploadImportFile,
    getAdminStudents,
    createNewStudent,
    uploadImagesImportFile,
    updateStudent,
    trainStudentImages,
  } = useAdminServices();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

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
    school_year: "",
    current_address: "",
    education_program: "",
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
      school_year: "",
      current_address: "",
      education_program: "",
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
      const response = await toast.promise(() => uploadImportFile(formData), {
        pending: "Đang import...",
        success: "Đã import xong 👌",
        error: {
          render: ({ data }) => {
            return `${data.message}`;
          },
        },
      });
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
      formData.append("file", files[0]);
      const response = await toast.promise(
        () => uploadImagesImportFile(formData),
        {
          pending: "Đang tải...",
          success: "Đã tải xong 👌",
          error: {
            render: ({ data }) => {
              return `${data.message}`;
            },
          },
        }
      );
      if (response) {
        removeArchiveFiles();
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
      setTotalRecords(response.total_students);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    getData();
  }, [page, rowsPerPage, search]);

  const handleCreateStudent = async () => {
    try {
      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("student_id", modalData?.student_id);
      formData.append(
        "citizen_identification_number",
        modalData?.citizen_identification_number
      );
      formData.append("gender", modalData?.gender === "Nam" ? true : false);
      formData.append("date_of_birth", modalData?.date_of_birth);
      formData.append("place_of_birth", modalData?.place_of_birth);
      formData.append("city_or_province", modalData?.city_or_province);
      formData.append("district", modalData?.district);
      formData.append("address", modalData?.address);
      formData.append("nationality", modalData?.nationality);
      formData.append("class", modalData?.class);
      formData.append("education_program", modalData?.education_program);
      formData.append("school_year", modalData?.school_year);
      formData.append("current_address", modalData?.current_address);

      const fullname = modalData?.fullname; // Lấy fullname từ nguồn dữ liệu

      if (fullname) {
        const nameParts = fullname.split(" ");
        const first_name = nameParts[nameParts.length - 1]; // Phần tử cuối cùng
        const last_name = nameParts[0]; // Phần tử đầu tiên

        // Xác định middle_name
        let middle_name = "";
        if (nameParts.length > 2) {
          // Nếu có ít nhất ba phần tử
          middle_name = nameParts.slice(1, nameParts.length - 1).join(" ");
        }
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("middle_name", middle_name);
      }

      const response = await createNewStudent(formData);

      if (response) {
        setModalViewStudent(response.student);
        if (isEdit) setIsEdit(false);
        setIsCreateNew(false);
        setData((prev) => [
          {
            ...response.student,
            gender: response.student.gender ? "Nam" : "Nữ",
            fullname: `${response.student.last_name} ${response.student.middle_name} ${response.student.first_name}`,
            student_type:
              response.student.student_type === "FORMAL"
                ? "Chính quy"
                : "Không xác định",
            learning_status: learningStatus[response.student.learning_status],
          },
          ...prev,
        ]);
        setTotalRecords((prev) => prev + 1);
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

  const handleEditClick = () => {
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const imgRef = useRef();
  const [portraitImgFile, setPortraitImgFile] = useState();
  const [previewPortraitImg, setPreviewPortraitImg] = useState("");

  const pickImgFileHandler = (e) => {
    let pickedFile;

    if (e.target.files) {
      pickedFile = e.target.files[0];
      setPortraitImgFile(pickedFile);
    }
  };

  const clearPortrailImg = () => {
    setPortraitImgFile(null);
    setPreviewPortraitImg("");
    if (imgRef.current) imgRef.current.value = null;
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
    if (isEdit) setIsEdit(false);
    if (isCreateNew) setIsCreateNew(false);
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
        gender:
          modalViewStudent?.gender === true
            ? "Nam"
            : modalViewStudent?.gender === false
            ? "Nữ"
            : modalViewStudent?.gender,
        date_of_birth: modalViewStudent?.date_of_birth,
        place_of_birth: modalViewStudent?.place_of_birth,
        city_or_province: modalViewStudent?.permanent_address.city_or_province,
        district: modalViewStudent?.permanent_address.district,
        address: modalViewStudent?.permanent_address.address,
        nationality: modalViewStudent?.nationality,
        class: modalViewStudent?.class,
        education_program: modalViewStudent?.education_program,
        current_address: modalViewStudent?.current_address,
        school_year:
          modalViewStudent?.school_year.from +
          " - " +
          modalViewStudent?.school_year.to,
      });
    }
  }, [modalViewStudent]);

  const handleUpdateStudent = async () => {
    try {
      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("student_id", modalData?.student_id);
      formData.append(
        "citizen_identification_number",
        modalData?.citizen_identification_number
      );
      formData.append("gender", modalData?.gender === "Nam" ? true : false);
      formData.append("date_of_birth", modalData?.date_of_birth);
      formData.append("place_of_birth", modalData?.place_of_birth);
      formData.append("city_or_province", modalData?.city_or_province);
      formData.append("district", modalData?.district);
      formData.append("address", modalData?.address);
      formData.append("nationality", modalData?.nationality);
      formData.append("class", modalData?.class);
      formData.append("education_program", modalData?.education_program);
      formData.append("school_year", modalData?.school_year);
      formData.append("current_address", modalData?.current_address);

      const fullname = modalData?.fullname; // Lấy fullname từ nguồn dữ liệu

      if (fullname) {
        const nameParts = fullname.split(" ");
        const first_name = nameParts[nameParts.length - 1]; // Phần tử cuối cùng
        const last_name = nameParts[0]; // Phần tử đầu tiên

        // Xác định middle_name
        let middle_name = "";
        if (nameParts.length > 2) {
          // Nếu có ít nhất ba phần tử
          middle_name = nameParts.slice(1, nameParts.length - 1).join(" ");
        }
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("middle_name", middle_name);
      }

      const response = await updateStudent(modalViewStudent._id, formData);

      if (response) {
        setIsEdit(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const trainData = async () => {
    try {
      toast.promise(trainStudentImages, {
        pending: "Đang train dữ liệu...",
        success: "Đã train xong 👌",
        error: "Có lỗi xảy ra 🤯",
      });
    } catch (err) {}
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
                {/*{usersSelected.length > 0 && (
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
                )}*/}
                <Stack spacing={1}>
                  <Button
                    onClick={() => {
                      clearModalData();
                      clearPortrailImg();
                      setIsCreateNew(true);
                      toggleModal();
                    }}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <AddIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    disabled={privateHttpRequest.isLoading}
                  >
                    Thêm
                  </Button>
                  <Button
                    onClick={trainData}
                    variant="contained"
                    disabled={privateHttpRequest.isLoading}
                  >
                    Train ảnh
                  </Button>
                </Stack>
              </div>
            </Stack>
            <StudentsSearch setSearch={setSearch} />
            {!privateHttpRequest.isLoading && (
              <AdminTable
                count={totalRecords}
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
                hasCheckBox={false}
              />
            )}
          </Stack>
        </Container>
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
            <div
              className={cx2("modal-main")}
              style={{ display: "flex", padding: "20px 0 30px 0px" }}
            >
              <div
                style={{
                  flex: 0.2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "250px",
                    cursor: isEdit || isCreateNew ? "pointer" : "",
                  }}
                  onClick={() => {
                    if (isEdit || isCreateNew) imgRef.current.click();
                  }}
                >
                  <img
                    style={{ width: "100%", maxHeight: "250px" }}
                    src={getStudentsImageSource(previewPortraitImg)}
                    alt="Ảnh thẻ sinh viên"
                  />
                  <input
                    id="portrait_img"
                    ref={imgRef}
                    type="file"
                    hidden
                    accept=".png,.jpg,.jpeg"
                    disabled={!isEdit && !isCreateNew}
                    onChange={pickImgFileHandler}
                  />
                </div>
              </div>
              <div className={cx2("modal-info")}>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>MSSV:</div>
                  <input
                    id="student_id"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.student_id}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Họ và tên:</div>
                  <input
                    id="fullname"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.fullname}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>CMND/CCCD:</div>
                  <input
                    id="citizen_identification_number"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.citizen_identification_number}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Niên khóa:</div>
                  <input
                    id="school_year"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.school_year}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Giới tính:</div>
                  <FormControl sx={{ width: "90.6%" }}>
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
                            readOnly={!isEdit && !isCreateNew}
                            disabled={
                              modalData?.gender === "Nam" &&
                              !isEdit &&
                              !isCreateNew
                                ? true
                                : false
                            }
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
                            readOnly={!isEdit && !isCreateNew}
                            disabled={
                              modalData?.gender === "Nữ" &&
                              !isEdit &&
                              !isCreateNew
                                ? true
                                : false
                            }
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
                            minwidth: 150,
                            width: "25%",
                            mr: 40.8,
                          },
                          variant: "standard",
                        },
                      }}
                      value={dayjs(new Date(modalData?.date_of_birth))}
                      format="DD/MM/YYYY"
                      readOnly={!isEdit && !isCreateNew}
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
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.place_of_birth}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Tỉnh/TP:</div>
                  <input
                    id="city_or_province"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.city_or_province}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quận/huyện:</div>
                  <input
                    id="district"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.district}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Địa chỉ thường trú:</div>
                  <input
                    id="address"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.address}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quốc tịch:</div>
                  <input
                    id="nationality"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.nationality}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Nơi ở hiện tại:</div>
                  <input
                    id="current_address"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.current_address}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Lớp học phần:</div>
                  <input
                    id="class"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.class}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Chương trình học:</div>
                  <input
                    id="education_program"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.education_program}
                    readOnly={!isEdit && !isCreateNew}
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
                    onClick={
                      isEdit
                        ? handleUpdateStudent
                        : isCreateNew
                        ? handleCreateStudent
                        : handleEditClick
                    }
                  >
                    {isEdit || isCreateNew ? "Lưu" : "Chỉnh sửa"}
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
