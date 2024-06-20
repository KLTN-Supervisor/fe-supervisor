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
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { UserSearch } from "./UserSeach";
import { UserTable } from "./UserTable";
// import { applyPagination } from "../../../../shared/util/apply-pagination";
// import { useSelection } from "../../../../shared/hook/use-selection";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames/bind";
import styles from "./UserModal.module.scss";
import styles2 from "../../../Supervisor/StudentCard/StudentCard.module.scss";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import ImportInput from "../UploadFile/ImportInput";
import CloseIcon from "@mui/icons-material/Close";
import { getStudentsImageSource } from "../../../../untils/getImageSource";
import { formatHour, formatDate } from "../../../../untils/format-date";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
// const now = new Date();

const UsersManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const {
    uploadImportFile,
    getAdminUsers,
    unBanUsers,
    banUsers,
    createAccount,
    updateAccount,
    resetAccountPassword,
  } = useAdminServices();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modifyDataLoading, setModifyDataLoading] = useState(false);

  const [usersSelected, setUsersSelected] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);

  const imgRef = useRef();
  const [portraitImgFile, setPortraitImgFile] = useState();
  const [previewPortraitImg, setPreviewPortraitImg] = useState("");

  useEffect(() => {
    if (!portraitImgFile) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewPortraitImg(fileReader.result);
    };
    fileReader.readAsDataURL(portraitImgFile);
  }, [portraitImgFile]);

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

  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState({
    _id: "",
    fullname: "",
    username: "",
    password: "",
    email: "",
    role: "",
    banned: "",
    online: "",
    last_online: "",
  });

  const clearModalData = () => {
    setModalData({
      _id: "",
      fullname: "",
      username: "",
      password: "",
      email: "",
      role: "",
      banned: "",
      online: "",
      last_online: "",
    });
  };

  const setViewItem = (item) => {
    if (!isCreateNew) {
      setPreviewPortraitImg(item?.portrait_img);
      setModalData({
        _id: item?._id,
        fullname: item?.full_name,
        username: item?.username,
        password: "",
        email: item?.email,
        role: item?.role,
        banned: item?.banned,
        online: item?.online,
        last_online: item?.last_online,
      });
    }
  };

  const toggleModal = () => {
    if (isEdit) setIsEdit(false);
    if (isCreateNew) setIsCreateNew(false);
    setModal(!modal);
  };

  const handleEditClick = () => {
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const changeHandler = (e) => {
    if (e.target?.name && e.target?.name === "role") {
      setModalData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    } else
      setModalData((prev) => ({
        ...prev,
        [e.target.id]: e.target.value,
      }));
  };

  const getData = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await getAdminUsers(
        page,
        rowsPerPage,
        search,
        roleFilter
      );
      if (response) {
        setData(response.accounts);
        setTotalRecords(response.total_accounts);
        setTotalPages(response.total_pages);
      }
    } catch (err) {
      console.log(err);
    }
    setDataLoading(false);
  }, [page, rowsPerPage, search, roleFilter]);

  useEffect(() => {
    getData();
  }, [page, rowsPerPage, search, roleFilter]);

  const handleBanUsers = async () => {
    const selectedIds = [...usersSelected]; // Sao chép usersSelected vào một mảng tạm thời
    setUsersSelected([]);

    try {
      const banPromises = selectedIds.map((id) => banUsers(id));

      const responses = await toast.promise(Promise.all(banPromises), {
        pending: "Đang ban...",
        success: "Thành công",
        error: {
          render: ({ data }) => {
            return `${data.message}`;
          },
        },
      });

      if (responses) {
        setData((prevData) =>
          prevData.map((user) =>
            selectedIds.includes(user._id) ? { ...user, banned: true } : user
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnBanUsers = async () => {
    const selectedIds = [...usersSelected]; // Sao chép usersSelected vào một mảng tạm thời

    setUsersSelected([]);

    try {
      const unBanPromises = selectedIds.map((id) => unBanUsers(id));

      const responses = await toast.promise(Promise.all(unBanPromises), {
        pending: "Đang gỡ ban...",
        success: "Thành công",
        error: {
          render: ({ data }) => {
            return `${data.message}`;
          },
        },
      });

      if (responses) {
        setData((prevData) =>
          prevData.map((user) =>
            selectedIds.includes(user._id) ? { ...user, banned: false } : user
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setDataLoading(true);
      const formData = new FormData();
      formData.append("avatar", portraitImgFile);
      formData.append("username", modalData?.username);
      formData.append("password", modalData?.password);
      formData.append("fullname", modalData?.fullname);
      formData.append("email", modalData?.email);
      formData.append("role", modalData?.role);

      const response = await toast.promise(() => createAccount(formData), {
        pending: "Đang tạo...",
        error: {
          render({ data }) {
            // When the promise reject, data will contains the error
            return `${data.message}`;
          },
        },
        success: "Tạo tài khoản mới thành công",
      });

      if (response) {
        if (isEdit) setIsEdit(false);
        setIsCreateNew(false);
        setData((prev) => [response.account, ...prev]);
        setTotalRecords((prev) => prev + 1);
        setDataLoading(false);
      }
    } catch (err) {
      console.error(err);
      setDataLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      setDataLoading(true);
      const formData = new FormData();
      formData.append("avatar", portraitImgFile);
      formData.append("username", modalData?.username);
      formData.append("fullname", modalData?.fullname);
      formData.append("email", modalData?.email);
      formData.append("role", modalData?.role);

      const response = await toast.promise(() => updateAccount(formData), {
        pending: "Đang tạo...",
        error: {
          render({ data }) {
            // When the promise reject, data will contains the error
            return `${data.message}`;
          },
        },
        success: "Cập nhật tài khoản thành công",
      });

      if (response) {
        if (isEdit) setIsEdit(false);
        setIsCreateNew(false);
        setDataLoading(false);
      }
    } catch (err) {
      console.error(err);
      setDataLoading(false);
    }
  };

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const userRole = {
    USER: "User thường",
    ADMIN: "Quản trị",
    ACADEMIC_AFFAIRS_OFFICE: "PĐT",
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
                <Typography variant="h4">Tài khoản</Typography>
                {/* <ImportInput
                  file={file}
                  fileIsValid={fileIsValid}
                  setFile={setFile}
                  setFileIsValid={setFileIsValid}
                  removeFile={removeFile}
                  uploadHandler={uploadFileHandler}
                /> */}
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
                  onClick={() => {
                    clearModalData();
                    toggleModal();
                    setIsCreateNew(true);
                  }}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <AddIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  disabled={privateHttpRequest.isLoading}
                >
                  Tạo
                </Button>
              </div>
            </Stack>
            <UserSearch setSearch={setSearch} />
            <FormControl
              variant="standard"
              className={cx("form__select")}
              sx={{
                border: "1px solid rgba(0, 85, 141, 0.5)",
                padding: "0px 16px",
                borderRadius: "10px",
                backgroundColor: "white",
              }}
            >
              <Select
                id="role"
                name="role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                displayEmpty
                disableUnderline
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "100%" }}
              >
                <MenuItem value="">
                  <em>Lọc theo quyền</em>
                </MenuItem>
                {Object.entries(userRole)?.length > 0 &&
                  Object.entries(userRole).map(([key, value]) => (
                    <MenuItem key={key} value={String(key)}>
                      {value}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <UserTable
              isLoading={dataLoading}
              count={totalRecords}
              data={data}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              setUsersSelected={setUsersSelected}
              selected={usersSelected}
              handleOnClick={(item) => {
                setViewItem(item);
                setModal(true);
              }}
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
            <div className={cx2("modal-header")}>Thông tin tài khoản</div>
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
                    id="avatar"
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
                  <div className={cx2("title")}>Tên đăng nhập:</div>
                  <input
                    id="username"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.username}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                {isCreateNew && (
                  <div className={cx2("info")}>
                    <div className={cx2("title")}>Mật khẩu:</div>
                    <input
                      id="password"
                      className={cx2(
                        "input-span",
                        !isEdit && !isCreateNew && "input-span-focus"
                      )}
                      value={modalData?.password}
                      readOnly={!isEdit && !isCreateNew}
                      onChange={changeHandler}
                    />
                  </div>
                )}
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Tên người dùng:</div>
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
                  <div className={cx2("title")}>Email:</div>
                  <input
                    id="email"
                    className={cx2(
                      "input-span",
                      !isEdit && !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.email}
                    readOnly={!isEdit && !isCreateNew}
                    onChange={changeHandler}
                  />
                </div>
                <div className={cx2("info")}>
                  <div className={cx2("title")}>Quyền tài khoản:</div>
                  <FormControl
                    variant="standard"
                    className={cx("form__select")}
                    sx={{
                      width: 0.843,
                      border: "1px solid rgba(0, 85, 141, 0.5)",
                      padding: "0px 16px",
                      borderRadius: "10px",
                      height: 28,
                    }}
                  >
                    <Select
                      id="role"
                      name="role"
                      value={modalData?.role}
                      onChange={changeHandler}
                      displayEmpty
                      disableUnderline
                      inputProps={{ "aria-label": "Without label" }}
                      sx={{ height: "100%" }}
                      readOnly={!isEdit && !isCreateNew}
                    >
                      <MenuItem value="">
                        <em>Chọn quyền</em>
                      </MenuItem>
                      {Object.entries(userRole)?.length > 0 &&
                        Object.entries(userRole).map(([key, value]) => (
                          <MenuItem key={key} value={String(key)}>
                            {value}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                {!isCreateNew && (
                  <>
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Trạng thái:</div>
                      <input
                        id="banned"
                        className={cx2("input-span", "input-span-focus")}
                        value={modalData?.banned ? "Bị khóa" : "Bình thường"}
                        readOnly
                      />
                    </div>
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Tình trạng:</div>
                      <input
                        id="online"
                        className={cx2("input-span", "input-span-focus")}
                        value={
                          modalData?.online ? "Đang hoạt động" : "Ngoại tuyến"
                        }
                        readOnly
                      />
                    </div>
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Lần đăng nhập cuối:</div>
                      <input
                        id="last_online"
                        className={cx2("input-span", "input-span-focus")}
                        value={
                          formatHour(modalData?.last_online) +
                          " " +
                          formatDate(modalData?.last_online)
                        }
                        readOnly
                      />
                    </div>
                  </>
                )}

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
                        ? handleUpdateAccount
                        : isCreateNew
                        ? handleCreateAccount
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

export default UsersManage;
