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
import { UserSearch } from "./UserSeach";
import { UserTable } from "./UserTable";
// import { applyPagination } from "../../../../shared/util/apply-pagination";
// import { useSelection } from "../../../../shared/hook/use-selection";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames/bind";
import styles from "./UserModal.module.scss";
import {
  banUsers,
  createUser,
  getAdminUsers,
  unBanUsers,
  uploadImportFile,
} from "../../../../services/adminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import ImportInput from "../UploadFile/ImportInput";

const cx = classNames.bind(styles);
// const now = new Date();

const UsersManage = () => {
  const privateHttpRequest = usePrivateHttpClient();

  const [visible, setVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [fetchPage, setFetchPage] = useState(1);

  const [usersSelected, setUsersSelected] = useState([]);
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

  const uploadFileHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadImportFile(
        formData,
        privateHttpRequest.privateRequest
      );
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
    const response = await getAdminUsers(
      page,
      rowsPerPage,
      privateHttpRequest.privateRequest,
      search
    );
    if (response) {
      if (page === 1) setData(response.accounts);
      else setData((prev) => [...prev, ...response.accounts]);
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
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

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
                  uploadHandler={uploadFileHandler}
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
            <UserSearch setSearch={setSearch} />
            {!privateHttpRequest.isLoading && (
              <UserTable
                count={data.length}
                data={data}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                setUsersSelected={setUsersSelected}
                selected={usersSelected}
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
            <div className={cx("title-modal")}>ADD USER</div>
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
                  <div>Username</div>
                </div>
                <input
                  id="username"
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

export default UsersManage;
