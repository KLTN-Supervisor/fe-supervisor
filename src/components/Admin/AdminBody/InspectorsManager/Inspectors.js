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
  CircularProgress,
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

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modifyDataLoading, setModifyDataLoading] = useState(false);

  const [usersSelected, setUsersSelected] = useState([]);
  const [modalData, setModalData] = useState({
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
  });

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

  const handleEditClick = () => {
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const handleCreateStudent = async () => {
    try {
      setModifyDataLoading(true);
      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("inspector_id", modalData?.inspector_id);
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
      const formData = new FormData();
      formData.append("image", portraitImgFile);
      formData.append("inspector_id", modalData?.inspector_id);
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
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Thanh tra</Typography>
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
          <div
            className={cx2("modal-navbar-content")}
            style={{ width: "80%", marginTop: 30 }}
          >
            <div className={cx2("modal-header")}>Thông tin thanh tra</div>
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
                  <div className={cx2("title")}>Mã thanh tra:</div>
                  <input
                    id="inspector_id"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.inspector_id}
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
                  <div className={cx2("title")}>Giới tính:</div>
                  <FormControl sx={{ width: "90.6%" }}>
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
      )}
    </>
  );
};

export default InspectorsManage;
