import { React, useCallback, useEffect, useRef, useState } from "react";
// import { subDays, subHours } from "date-fns";
import VerticalAlignTopOutlinedIcon from "@mui/icons-material/VerticalAlignTopOutlined";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  TextField,
} from "@mui/material";
import { UserSearch } from "./UserSeach";
import { UserTable } from "./UserTable";
// import { applyPagination } from "../../../../shared/util/apply-pagination";
// import { useSelection } from "../../../../shared/hook/use-selection";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import classNames from "classnames/bind";
import styles from "./UserModal.module.scss";
import styles2 from "../../../Supervisor/StudentCard/StudentCard.module.scss";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import CloseIcon from "@mui/icons-material/Close";
import { getStudentsImageSource } from "../../../../untils/getImageSource";
import { formatHour, formatDate } from "../../../../untils/format-date";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
// const now = new Date();

const UsersManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const {
    getAdminUsers,
    unBanUsers,
    banUsers,
    createAccount,
    updateAccount,
    resetAccountPassword,
    getAdminInspectors,
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

  const accountInfo = {
    _id: "",
    fullname: "",
    username: "",
    password: "",
    email: "",
    role: "",
    inspector: "",
    banned: "",
    online: "",
    last_online: "",
  };

  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState(accountInfo);
  const [errors, setErrors] = useState(accountInfo);

  const clearModalData = () => {
    setModalData(accountInfo);
  };

  const clearValidateErrors = () => {
    setErrors(accountInfo);
  };

  const validateModalData = (data) => {
    let validationErrors = {};

    // Validate student_id
    if (!data.role || data.role === "") {
      validationErrors.role = "Vui lòng chọn quyền tài khoản";
    }
    if (isCreateNew) {
      // Validate username
      if (!data.username) {
        validationErrors.username = "Tên đăng nhập là bắt buộc";
      } else if (data.username.length < 4 || data.username.length > 15) {
        validationErrors.username =
          "Tên đăng nhập phải có độ dài từ 4 đến 15 ký tự";
      } else if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
        validationErrors.username =
          "Tên người dùng không được chứa khoảng trắng hoặc ký tự đặc biệt";
      }
    }
    if (isCreateNew) {
      if (!data.password) {
        // Validate password
        validationErrors.password = "Mật khẩu là bắt buộc";
      } else if (data.password.length < 6 || data.password.length > 20) {
        validationErrors.password = "Mật khẩu phải có độ dài từ 6 đến 20 ký tự";
      } else if (!/^\S+$/.test(data.password)) {
        validationErrors.password = "Mật khẩu không được chứa khoảng trắng";
      }
    }
    // Validate fullname
    if (!data.fullname) {
      validationErrors.fullname = "Tên tài khoản là bắt buộc";
    } else if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(data.fullname)) {
      validationErrors.fullname =
        "Tên tài khoản không được chứa số hoặc ký tự đặc biệt";
    }

    // Validate email
    if (!data.email) {
      validationErrors.email = "Email là bắt buộc";
    } else if (!/^[a-z0-9.-]+@[a-z.]+\.[a-z]{2,4}$/.test(data.email)) {
      validationErrors.email = "Email không hợp lệ";
    }

    return validationErrors;
  };

  const setViewItem = (item) => {
    if (!isCreateNew) {
      setPreviewPortraitImg(item?.avatar);
      setModalData({
        _id: item?._id,
        fullname: item?.full_name,
        username: item?.username,
        password: "",
        email: item?.email,
        role: item?.role,
        inspector: item?.inspector,
        banned: item?.banned,
        online: item?.online,
        last_online: item?.last_online,
      });
    }
  };

  const toggleModal = () => {
    clearValidateErrors();
    if (isEdit) setIsEdit(false);
    if (isCreateNew) setIsCreateNew(false);
    setModal(!modal);
  };

  const handleEditClick = () => {
    clearValidateErrors();
    if (isEdit) clearPortrailImg();
    setIsEdit(!isEdit);
  };

  const changeHandler = (e) => {
    if (e.target.value.trim() !== "")
      setErrors((prev) => ({
        ...prev,
        [e.target.id]: "",
      }));
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
    document.title = "Quản lý tài khoản";
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
      setModifyDataLoading(true);

      const validationErrors = validateModalData(modalData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setModifyDataLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("avatar", portraitImgFile);
      if (modalData.role === "USER" && modalData?.inspector)
        formData.append("inspectorID", modalData?.inspector);
      formData.append("username", modalData?.username);
      formData.append("password", modalData?.password);
      formData.append("full_name", modalData?.fullname);
      formData.append("email", modalData?.email);
      formData.append("role", modalData?.role);

      const response = await createAccount(formData);

      if (response) {
        toast.success("Tạo tài khoản mới thành công");
        if (isEdit) setIsEdit(false);
        setIsCreateNew(false);
        setData((prev) => [response.account, ...prev]);
        setTotalRecords((prev) => prev + 1);
        setModifyDataLoading(false);
        toggleModal();
      }
    } catch (err) {
      toast.error(err.message);
      setModifyDataLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      setModifyDataLoading(true);

      const validationErrors = validateModalData(modalData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setModifyDataLoading(false);
        return;
      }

      const formData = new FormData();
      if (portraitImgFile) formData.append("avatar", portraitImgFile);
      if (modalData.role === "USER" && modalData?.inspector)
        formData.append("inspectorID", modalData?.inspector);
      formData.append("full_name", modalData?.fullname);
      formData.append("email", modalData?.email);
      formData.append("role", modalData?.role);

      const response = await updateAccount(modalData._id, formData);

      if (response) {
        toast.success("Cập nhật tài khoản thành công");
        if (isEdit) setIsEdit(false);
        setData((prev) => {
          return prev.map((account, i) => {
            if (account._id === response.account._id) return response.account;
            return account;
          });
        });
        setIsCreateNew(false);
        setModifyDataLoading(false);
        toggleModal();
      }
    } catch (err) {
      toast.error(err.message);
      setModifyDataLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const responses = await toast.promise(
        () => resetAccountPassword(modalData._id),
        {
          pending: "Đang reset...",
          success: {
            render: ({ data }) => {
              return `${data.message}`;
            },
          },
          error: {
            render: ({ data }) => {
              return `${data.message}`;
            },
          },
        }
      );

      if (responses) {
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [showPassword, setShowPassword] = useState(false);


  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const [inspectorSearch, setInspectorSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      try {
        const response = await getAdminInspectors(1, 50, inspectorSearch);

        if (active) {
          if (response) setOptions([...response.inspectors]);
        }
      } catch (err) {}
    })();

    return () => {
      active = false;
    };
  }, [loading, inspectorSearch]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const userRole = {
    USER: "Thanh tra",
    ADMIN: "Quản trị",
    ACADEMIC_AFFAIRS_OFFICE: "Phòng đào tạo",
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
                <div className={cx("title")}>
                  <h6 className={cx("text")}>Tài khoản</h6>
                </div>
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
                    clearPortrailImg();
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
                sx={{ height: "100%", p: 1 }}
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
                clearPortrailImg();
                setViewItem(item);
                setModal(true);
              }}
              setRoleFilter={setRoleFilter}
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
            <div className={cx2("modal-header")}>Thông tin tài khoản</div>
            <div
              className={cx2("modal-main")}
              style={{ display: "flex", padding: "20px 0 30px 0px" }}
            >
              <div
                style={{
                  flex: 0.25,
                  marginLeft: 20,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
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
                    ...((isEdit || isCreateNew) && {
                      border: "black solid 1px",
                      borderRadius: 10,
                    }),
                  }}
                  onClick={() => {
                    if (isEdit || isCreateNew) imgRef.current.click();
                  }}
                >
                  <img
                    style={{ width: "100%", maxHeight: "200px" }}
                    src={getStudentsImageSource(previewPortraitImg)}
                    alt="Avatar"
                  />
                  {(isEdit || isCreateNew) && (
                    <EditIcon style={{ color: "#e6e614", marginTop: 10 }} />
                  )}
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
              <div className={cx2("modal-info")} style={{ width: "90%" }}>
                <div className={cx2("info")} style={{ marginLeft: 10, marginTop: 10 }}>
                  <div className={cx2("title")}>Quyền tài khoản:</div>
                  <FormControl
                    variant="standard"
                    className={cx("form__select")}
                    sx={{
                      width: 0.843,
                      border:
                        !isEdit && !isCreateNew
                          ? "none"
                          : "1px solid rgba(0, 85, 141, 0.5)",
                      padding: "5px 8px",
                      borderRadius: "10px",
                      height: 24,
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
                    {errors?.role}
                  </span>
                </div>
                {modalData.role === "USER" && (
                  <>
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Thanh tra:</div>
                      <Autocomplete
                        id="inspector"
                        sx={{
                          width: "89%",
                          ":active": { color: "rgba(0, 148, 246, 0.69)" },
                        }}
                        open={open}
                        onOpen={() => {
                          setOpen(true);
                        }}
                        onClose={() => {
                          setOpen(false);
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.inspector_id === value.inspector_id
                        }
                        getOptionLabel={(option) =>
                          `${option.inspector_id} - ${option.last_name} ${option.middle_name} ${option.first_name}`
                        }
                        readOnly={!isEdit && !isCreateNew}
                        getOptionKey={(option) => `${option._id}`}
                        noOptionsText={"Không tìm thấy thanh tra"}
                        loadingText={"Đang tìm kiếm..."}
                        options={options}
                        loading={loading}
                        autoHighlight
                        inputMode="search"
                        size="small"
                        onInputChange={(e, value, reason) => {
                          if (isCreateNew || isEdit) {
                            setOptions([]);
                            setInspectorSearch(value);

                            if (reason === "reset") {
                              const choosedOpt = options.find(
                                (opt) =>
                                  opt.inspector_id ===
                                  value.split("-")[0].trim()
                              );

                              setModalData((prev) => ({
                                ...prev,
                                inspector: choosedOpt?.inspector_id
                                  ? choosedOpt?.inspector_id
                                  : prev?.inspector,
                                fullname: choosedOpt?.inspector_id
                                  ? `${choosedOpt.last_name} ${choosedOpt.middle_name} ${choosedOpt.first_name}`
                                  : prev?.fullname,
                                email: prev?.email
                                  ? prev.email
                                  : choosedOpt?.email,
                              }));
                            }
                          }
                        }}
                        {...(!isCreateNew && {
                          inputValue: isEdit
                            ? inspectorSearch
                            : modalData?.inspector &&
                              `${modalData.inspector.inspector_id} - ${modalData.inspector.last_name} ${modalData.inspector.middle_name} ${modalData.inspector.first_name}`,
                        })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Thanh tra"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                              sx: { borderRadius: 3 },
                            }}
                          />
                        )}
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
                        {errors?.inspector}
                      </span>
                    </div>
                  </>
                )}
                <div className={cx2("info")} style={{ marginLeft: 10 }}>
                  <div className={cx2("title")}>Tên đăng nhập:</div>
                  <input
                    id="username"
                    style={{
                      border: !isCreateNew && "none",
                      ...(errors?.username &&
                        errors?.username.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
                    className={cx2(
                      "input-span",
                      !isCreateNew && "input-span-focus"
                    )}
                    value={modalData?.username}
                    readOnly={!isCreateNew}
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
                    {errors?.username}
                  </span>
                </div>
                {isCreateNew && (
                  <>
                    <div className={cx2("info")} style={{ marginLeft: 10 }}>
                      <div className={cx2("title")}>Mật khẩu:</div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        style={{
                          border: !isEdit && !isCreateNew && "none",
                          ...(errors?.password &&
                            errors?.password.trim() !== "" && {
                              borderColor: "red",
                            }),
                        }}
                        className={cx2(
                          "input-span",
                          !isEdit && !isCreateNew && "input-span-focus"
                        )}
                        value={modalData?.password}
                        readOnly={!isEdit && !isCreateNew}
                        onChange={changeHandler}
                      />
                      {showPassword ?
                      <VisibilityIcon className={cx2("password-icon")}  
                        onClick={()=>setShowPassword(false)}/> :
                      <VisibilityOffIcon className={cx2("password-icon")}
                        onClick={()=>setShowPassword(true)}/>}
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
                        {errors?.password}
                      </span>
                    </div>
                  </>
                )}
                <div className={cx2("info")} style={{ marginLeft: 10 }}>
                  <div className={cx2("title")}>Tên người dùng:</div>
                  <input
                    id="fullname"
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.fullname &&
                        errors?.fullname.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
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
                <div className={cx2("info")} style={{ marginLeft: 10 }}>
                  <div className={cx2("title")}>Email:</div>
                  <input
                    id="email"
                    style={{
                      border: !isEdit && !isCreateNew && "none",
                      ...(errors?.email &&
                        errors?.email.trim() !== "" && {
                          borderColor: "red",
                        }),
                    }}
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
                {!isCreateNew && (
                  <>
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Tình trạng:</div>
                      <input
                        id="banned"
                        style={{ border: "none" }}
                        className={cx2("input-span", "input-span-focus")}
                        value={modalData?.banned ? "Bị khóa" : "Còn hoạt động"}
                        readOnly
                      />
                    </div>
                    {/* <div className={cx2("info")}>
                      <div className={cx2("title")}>Trạng thái</div>
                      <input
                        id="online"
                        style={{ border: "none" }}
                        className={cx2("input-span", "input-span-focus")}
                        value={
                          modalData?.online ? "Đang hoạt động" : "Ngoại tuyến"
                        }
                        readOnly
                      />
                    </div> */}
                    <div className={cx2("info")}>
                      <div className={cx2("title")}>Lần đăng nhập cuối:</div>
                      <input
                        id="last_online"
                        style={{ border: "none" }}
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
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
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
                    {!isCreateNew && (
                      <button
                        className={cx2("button")}
                        style={{
                          backgroundColor: "#FD661E",
                        }}
                        onClick={handleResetPassword}
                        disabled={modifyDataLoading}
                      >
                        Đặt lại mật khẩu
                      </button>
                    )}
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

export default UsersManage;
