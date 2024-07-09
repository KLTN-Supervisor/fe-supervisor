import { React, useCallback, useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  SvgIcon,
} from "@mui/material";
import { StudentsSearch } from "./StudentsSearch";
import { AdminTable } from "../Common/AdminTable/Table";
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
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
// const now = new Date();

const InspectorsManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const {
    uploadImportFile,
    getAdminInspectors,
    uploadImagesImportFile,
    createNewInspector,
    updateInspector,
  } = useAdminServices();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modifyDataLoading, setModifyDataLoading] = useState(false);

  const inspectorInfo = {
    _id: "",
    inspector_id: "",
    fullname: "",
    citizen_identification_number: "",
    gender: "",
    date_of_birth: "",
    place_of_birth: "",
    city_or_province: "",
    district: "",
    address: "",
    nationality: "",
    current_address: "",
  };

  const [usersSelected, setUsersSelected] = useState([]);
  const [modalData, setModalData] = useState(inspectorInfo);
  const [errors, setErrors] = useState(inspectorInfo);

  const clearValidateErrors = () => {
    setErrors(inspectorInfo);
  };

  const [file, setFile] = useState();
  const [fileIsValid, setFileIsValid] = useState();

  const removeFile = () => {
    setFile(null);
    setFileIsValid(false);
  };

  const uploadImportInspectorsFileHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await toast.promise(
        () => uploadImportFile(formData, "inspectors"),
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
    if (e.target.value.trim() !== "")
      setErrors((prev) => ({
        ...prev,
        [e.target.id]: "",
      }));
    setModalData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const getData = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await getAdminInspectors(page, rowsPerPage, search);
      if (response) {
        setData(
          response.inspectors.map((inspector) => {
            return {
              ...inspector,
              gender: inspector.gender ? "Nam" : "Nữ",
              fullname: `${inspector.last_name} ${inspector.middle_name} ${inspector.first_name}`,
              working_status:
                inspector.working_status === "WORKING"
                  ? "Còn làm việc"
                  : "Không xác định",
            };
          })
        );
        setTotalRecords(response.total_inspectors);
        setTotalPages(response.total_pages);
        setDataLoading(false);
      }
    } catch (err) {
      setDataLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    getData();
  }, [page, rowsPerPage, search]);

  // useEffect(() => {}, [data]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const clearModalData = () => {
    setModalData({
      _id: "",
      inspector_id: "",
      fullname: "",
      citizen_identification_number: "",
      email: "",
      gender: "",
      date_of_birth: "",
      place_of_birth: "",
      city_or_province: "",
      district: "",
      address: "",
      nationality: "",
      current_address: "",
    });
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

  const [isEdit, setIsEdit] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);

  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    clearValidateErrors();
    if (isEdit) setIsEdit(false);
    if (isCreateNew) setIsCreateNew(false);
    setModal(!modal);
  };

  const setViewItem = (item) => {
    if (!isCreateNew) {
      setPreviewPortraitImg(item?.portrait_img);
      setModalData({
        _id: item?._id,
        inspector_id: item?.inspector_id,
        fullname: item?.fullname,
        citizen_identification_number: item?.citizen_identification_number,
        email: item?.email,
        gender:
          item?.gender === true
            ? "Nam"
            : item?.gender === false
            ? "Nữ"
            : item?.gender,
        date_of_birth: item?.date_of_birth,
        place_of_birth: item?.place_of_birth,
        city_or_province: item?.permanent_address.city_or_province,
        district: item?.permanent_address.district,
        address: item?.permanent_address.address,
        nationality: item?.nationality,
        current_address: item?.current_address,
      });
    }
  };

  const validateModalData = (data) => {
    let validationErrors = {};

    // Validate student_id
    if (!data.inspector_id) {
      validationErrors.inspector_id = "Mã thanh tra là bắt buộc.";
    } else if (data.inspector_id.length < 8 || data.inspector_id.length > 15) {
      validationErrors.inspector_id =
        "Mã thanh tra phải có độ dài từ 8 đến 15 ký tự.";
    }
    // Validate citizen_identification_number
    if (!data.citizen_identification_number) {
      validationErrors.citizen_identification_number =
        "Số CCCD/CMND là bắt buộc.";
    } else if (
      data.citizen_identification_number.length < 9 ||
      data.citizen_identification_number.length > 12
    ) {
      validationErrors.citizen_identification_number =
        "Số CCCD/CMND phải có độ dài từ 9 đến 12 ký tự.";
    } else if (!/^\d+$/.test(data.citizen_identification_number)) {
      validationErrors.citizen_identification_number =
        "Số CCCD/CMND chỉ được chứa các ký tự số.";
    }

    // Validate email
    if (!data.email) {
      validationErrors.email = "Email là bắt buộc";
    } else if (!/^[a-z0-9.-]+@[a-z.]+\.[a-z]{2,4}$/.test(data.email)) {
      validationErrors.email = "Email không hợp lệ";
    }
    // Validate fullname
    if (!data.fullname) {
      validationErrors.fullname = "Họ và tên là bắt buộc.";
    } else if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(data.fullname)) {
      validationErrors.fullname =
        "Họ và tên không được chứa số hoặc ký tự đặc biệt.";
    }
    // Validate first_name, middle_name, last_name (extracted from fullname)
    const nameParts = data.fullname ? data.fullname.split(" ") : [];
    if (nameParts.length < 3) {
      validationErrors.fullname = "Họ và tên không hợp lệ.";
    } else {
      const first_name = nameParts[nameParts.length - 1];
      const last_name = nameParts[0];
      const middle_name = nameParts.slice(1, nameParts.length - 1).join(" ");

      if (first_name.length < 1 || first_name.length > 10) {
        validationErrors.fullname = "Tên phải có độ dài từ 1 đến 10 ký tự.";
      }
      if (last_name.length < 2 || last_name.length > 12) {
        validationErrors.fullname = "Họ phải có độ dài từ 2 đến 12 ký tự.";
      }
      if (middle_name.length < 2) {
        validationErrors.fullname = "Tên đệm phải có ít nhất 2 ký tự.";
      }
    }
    // Validate gender
    if (!data.gender) {
      validationErrors.gender = "Giới tính là bắt buộc.";
    }
    // Validate date_of_birth
    if (!data.date_of_birth) {
      validationErrors.date_of_birth = "Ngày sinh là bắt buộc.";
    }
    // Validate place_of_birth
    if (!data.place_of_birth) {
      validationErrors.place_of_birth = "Nơi sinh là bắt buộc.";
    }
    // Validate city_or_province
    if (!data.city_or_province) {
      validationErrors.city_or_province = "Tỉnh/Thành phố là bắt buộc.";
    }
    // Validate district
    if (!data.district) {
      validationErrors.district = "Quận/Huyện là bắt buộc.";
    }
    // Validate address
    if (!data.address) {
      validationErrors.address = "Địa chỉ là bắt buộc.";
    }
    // Validate nationality
    if (!data.nationality) {
      validationErrors.nationality = "Quốc tịch là bắt buộc.";
    }

    // Validate current_address
    if (!data.current_address) {
      validationErrors.current_address = "Địa chỉ hiện tại là bắt buộc.";
    }

    return validationErrors;
  };

  const handleEditClick = () => {
    clearValidateErrors();
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const handleCreateStudent = async () => {
    try {
      setModifyDataLoading(true);

      const validationErrors = validateModalData(modalData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setModifyDataLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("inspector_id", modalData?.inspector_id);
      formData.append(
        "citizen_identification_number",
        modalData?.citizen_identification_number
      );
      formData.append("email", modalData?.email);
      formData.append("gender", modalData?.gender === "Nam" ? true : false);
      formData.append("date_of_birth", modalData?.date_of_birth);
      formData.append("place_of_birth", modalData?.place_of_birth);
      formData.append("city_or_province", modalData?.city_or_province);
      formData.append("district", modalData?.district);
      formData.append("address", modalData?.address);
      formData.append("nationality", modalData?.nationality);
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

      const response = await createNewInspector(formData);

      if (response) {
        toast.success("Tạo mới thành công!");

        setData((prev) => [
          {
            ...response.inspector,
            gender: response.inspector.gender ? "Nam" : "Nữ",
            fullname: `${response.inspector.last_name} ${response.inspector.middle_name} ${response.inspector.first_name}`,
            working_status:
              response.inspector.working_status === "WORKING"
                ? "Còn làm việc"
                : "Không xác định",
          },
          ...prev,
        ]);
        setTotalRecords((prev) => prev + 1);
        if (modal) toggleModal();
      }
      setModifyDataLoading(false);
    } catch (err) {
      toast.error(err.message);
      setModifyDataLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    try {
      setModifyDataLoading(true);

      const validationErrors = validateModalData(modalData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setModifyDataLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("inspector_id", modalData?.inspector_id);
      formData.append(
        "citizen_identification_number",
        modalData?.citizen_identification_number
      );
      formData.append("email", modalData?.email);
      formData.append("gender", modalData?.gender === "Nam" ? true : false);
      formData.append("date_of_birth", modalData?.date_of_birth);
      formData.append("place_of_birth", modalData?.place_of_birth);
      formData.append("city_or_province", modalData?.city_or_province);
      formData.append("district", modalData?.district);
      formData.append("address", modalData?.address);
      formData.append("nationality", modalData?.nationality);
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

      const response = await updateInspector(modalData._id, formData);

      if (response) {
        toast.success("Cập nhật thành công!");
        // Cập nhật record trong setData
        setData((prevData) => {
          const updatedData = prevData.map((inspector) => {
            if (inspector._id === response.inspector._id) {
              return {
                ...response.inspector,
                gender: response.inspector.gender ? "Nam" : "Nữ",
                fullname: `${response.inspector.last_name} ${response.inspector.middle_name} ${response.inspector.first_name}`,
                working_status:
                  response.inspector.working_status === "WORKING"
                    ? "Còn làm việc"
                    : "Không xác định",
              };
            }
            return inspector;
          });
          return updatedData;
        });
        if (modal) toggleModal();
      }
      setModifyDataLoading(false);
    } catch (err) {
      toast.error(err.message);
      setModifyDataLoading(false);
    }
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
          <div className={cx("title")} style={{ margin: "0 0 15px 0" }}>
            <h6 className={cx("text")}>Thanh tra</h6>
          </div>
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Stack spacing={1}>
                <ImportInput
                  file={file}
                  fileIsValid={fileIsValid}
                  setFile={setFile}
                  setFileIsValid={setFileIsValid}
                  removeFile={removeFile}
                  uploadHandler={uploadImportInspectorsFileHandler}
                />
              </Stack>

              <div>
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
                  Add
                </Button>
              </div>
            </Stack>
            <StudentsSearch setSearch={setSearch} />

            <AdminTable
              isLoading={dataLoading}
              count={totalRecords}
              data={data}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              setItemsSelected={setUsersSelected}
              selected={usersSelected}
              colsName={["Mã thanh tra", "Tên", "Giới tính", "Tình trạng"]}
              colsData={[
                "inspector_id",
                "fullname",
                "gender",
                "working_status",
              ]}
              onClickItem={(item) => {
                setViewItem(item);
                toggleModal();
              }}
              hasCheckBox={false}
            />
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
          <div className={cx2("modal-navbar-content")} style={{ width: "80%" }}>
            <div className={cx2("modal-header")}>Thông tin thanh tra</div>
            <div
              className={cx2("modal-main")}
              style={{ display: "flex", padding: "15px 0 10px 0px" }}
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
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "250px",
                    cursor: isEdit || isCreateNew ? "pointer" : "",
                  }}
                  onClick={() => {
                    if (isEdit || isCreateNew) imgRef.current.click();
                  }}
                >
                  <img
                    style={{ width: "100%", maxHeight: "200px" }}
                    src={getStudentsImageSource(previewPortraitImg)}
                    alt="Ảnh thẻ sinh viên"
                  />
                  <EditIcon style={{ color: "#e6e614", marginTop: 10 }} />
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
                  <div className={cx2("title")}>Mã thanh tra:</div>
                  <input
                    id="inspector_id"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.inspector_id &&
                        errors?.inspector_id.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.inspector_id}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.inspector_id}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Họ và tên:</div>
                  <input
                    id="fullname"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.fullname &&
                        errors?.fullname.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.fullname}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.fullname}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>CMND/CCCD:</div>
                  <input
                    id="citizen_identification_number"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.citizen_identification_number &&
                        errors?.citizen_identification_number.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.citizen_identification_number}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.citizen_identification_number}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Email:</div>
                  <input
                    id="email"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.email &&
                        errors?.email.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.email}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.email}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Giới tính:</div>
                  <FormControl
                    sx={{ pt: 0.5, pb: 0.5 }}
                    className={cx2("form-control")}
                  >
                    <RadioGroup
                      row
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
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.gender}
                  </span>
                </div>
                <div className={cx2("info")} style={{ marginTop: 0 }}>
                  <div className={cx2("title")} style={{ marginTop: 5 }}>
                    Ngày sinh:
                  </div>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    style={{ maxWidth: "60%" }}
                    className={cx2("form-control")}
                  >
                    <DatePicker
                      className={cx2("form-control")}
                      slotProps={{
                        textField: {
                          inputProps: {
                            style: { padding: "5px 0px" },
                          },
                          sx: {
                            p: 0.2,
                            minwidth: 200,
                            width: "90%",
                          },
                          variant: "standard",
                        },
                      }}
                      value={dayjs(new Date(modalData?.date_of_birth))}
                      format="DD/MM/YYYY"
                      readOnly={!isEdit && !isCreateNew}
                      onChange={(value) => {
                        setErrors((prev) => ({
                          ...prev,
                          date_of_birth: "",
                        }));
                        setModalData((prev) => ({
                          ...prev,
                          date_of_birth: value,
                        }));
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.date_of_birth}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Nơi sinh:</div>
                  <input
                    id="place_of_birth"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.place_of_birth &&
                        errors?.place_of_birth.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.place_of_birth}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.place_of_birth}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Tỉnh/TP:</div>
                  <input
                    id="city_or_province"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.city_or_province &&
                        errors?.city_or_province.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.city_or_province}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.city_or_province}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quận/huyện:</div>
                  <input
                    id="district"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.district &&
                        errors?.district.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.district}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.district}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Địa chỉ thường trú:</div>
                  <input
                    id="address"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.address &&
                        errors?.address.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.address}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.address}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quốc tịch:</div>
                  <input
                    id="nationality"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.nationality &&
                        errors?.nationality.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.nationality}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.nationality}
                  </span>
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Nơi ở hiện tại:</div>
                  <input
                    id="current_address"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.current_address &&
                        errors?.current_address.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    value={modalData?.current_address}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div
                    className={cx2("title")}
                    style={{ marginRight: 5 }}
                  ></div>
                  <span
                    style={{
                      color: "red",
                      border: "none",
                      marginLeft: -2,
                      padding: 0,
                      fontWeight: 540,
                      marginTop: -3,
                      fontSize: 12,
                    }}
                  >
                    {errors?.current_address}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      width: "80%",
                      paddingBottom: 20,
                      margin: "15px auto auto",
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
                      disabled={modifyDataLoading}
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
                      disabled={modifyDataLoading}
                    >
                      {modifyDataLoading ? (
                        <CircularProgress size={25} sx={{ mt: 0.5 }} />
                      ) : isEdit || isCreateNew ? (
                        "Lưu"
                      ) : (
                        "Chỉnh sửa"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InspectorsManage;
