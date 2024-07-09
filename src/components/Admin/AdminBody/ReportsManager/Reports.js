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
import { ReportTable } from "./ReportTable";
// import { applyPagination } from "../../../../shared/util/apply-pagination";
// import { useSelection } from "../../../../shared/hook/use-selection";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames/bind";
import styles from "./ReportModal.module.scss";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getStudentsImageSource } from "../../../../untils/getImageSource";
import { formatHour, formatDate } from "../../../../untils/format-date";

const cx = classNames.bind(styles);
// const now = new Date();

const UsersManage = () => {
  const privateHttpRequest = usePrivateHttpClient();
  const { getYears, getTerms, getReports } = useAdminServices();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [usersSelected, setUsersSelected] = useState([]);

  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [imageIndex, setImageIndex] = useState(0);
  const [isFirstImage, setIsFirstImage] = useState(true);
  const [isLastImage, setIsLastImage] = useState(false);

  function showNextImage() {
    if (modalData)
      setImageIndex((index) => {
        if (index === modalData.images.length - 2) {
          setIsLastImage(true);
          setIsFirstImage(false);
          return modalData.images.length - 1;
        } else {
          setIsLastImage(false);
          setIsFirstImage(false);
          return index + 1;
        }
      });
  }

  function showPrevImage() {
    setImageIndex((index) => {
      if (index === 1) {
        setIsLastImage(false);
        setIsFirstImage(true);

        return 0;
      } else {
        setIsLastImage(false);
        setIsFirstImage(false);

        return index - 1;
      }
    });
  }

  const toggleModal = () => {
    setModal(!modal);
  };

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const [year, setYear] = useState("");
  const [years, setYears] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState("");
  const handleTermChange = (event) => {
    setTerm(event.target.value);
  };

  const getYearExam = async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getYears();

        setYears(response);
        setStudentsLoading(false);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get year error: ", err);
      }
    }
  };

  const getTermsExam = useCallback(async () => {
    if (!studentsLoading) {
      setStudentsLoading(true);
      try {
        const response = await getTerms(year);

        setTerms(response);
        setStudentsLoading(false);
      } catch (err) {
        setStudentsLoading(false);
        console.log("get terms error: ", err);
      }
    }
  }, [year]);

  const getData = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await getReports(year, term, page, rowsPerPage);
      if (response) {
        setData(response.reports);
        setTotalRecords(response.total_records);
        setTotalPages(response.total_pages);
        setDataLoading(false);
      }
    } catch (err) {
      console.log(err);
      setDataLoading(false);
    }
  }, [year, term, page, rowsPerPage]);

  useEffect(() => {
    if (year !== "" && term !== "") getData();
  }, [year, term, page, rowsPerPage]);

  useEffect(() => {
    document.title = "Xem báo cáo";
    getYearExam();
  }, []);

  useEffect(() => {
    getTermsExam();
  }, [year]);

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
          <div className={cx("title")} style={{ margin: 0 }}>
            <h6 className={cx("text")}>Báo cáo sự cố</h6>
          </div>
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Stack spacing={1}>
                {/* <ImportInput
                  file={file}
                  fileIsValid={fileIsValid}
                  setFile={setFile}
                  setFileIsValid={setFileIsValid}
                  removeFile={removeFile}
                  uploadHandler={uploadFileHandler}
                /> */}
              </Stack>
              {/* <div>
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
              </div> */}
            </Stack>
            <div style={{ direction: "row", display: "flex" }}>
              <FormControl
                variant="standard"
                className={cx("form__select")}
                sx={{
                  width: 0.9,
                  border: "1px solid rgba(0, 85, 141, 0.5)",
                  padding: "3px 16px",
                  borderRadius: "10px",
                  marginRight: 2,
                }}
              >
                <Select
                  value={year}
                  onChange={handleYearChange}
                  displayEmpty
                  disableUnderline
                  inputProps={{ "aria-label": "Without label" }}
                  sx={{ height: "100%", marginRight: 0 }}
                >
                  <MenuItem value="">
                    <em>Chọn năm</em>
                  </MenuItem>
                  {years?.length > 0 &&
                    years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y} - {y + 1}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl
                variant="standard"
                className={cx("form__select")}
                sx={{
                  width: 0.9,
                  border: "1px solid rgba(0, 85, 141, 0.5)",
                  padding: "3px 16px",
                  borderRadius: "10px",
                }}
              >
                <Select
                  value={term}
                  onChange={handleTermChange}
                  displayEmpty
                  disableUnderline
                  inputProps={{ "aria-label": "Without label" }}
                  sx={{ height: "100%", marginRight: 0 }}
                >
                  <MenuItem value="">
                    <em>Chọn học kỳ</em>
                  </MenuItem>
                  {terms?.length > 0 &&
                    terms.map((t) => (
                      <MenuItem key={t} value={t}>
                        Học kỳ {t}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            {!privateHttpRequest.isLoading && (
              <ReportTable
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
                  setModalData(item);
                  setModal(true);
                }}
              />
            )}
          </Stack>
        </Container>
      </Box>
      {modal && (
        <div className={cx("modal active-modal")}>
          <div
            onClick={toggleModal}
            className={cx("overlay")}
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
          <div className={cx("modal-content")}>
            <div className={cx("modal-header")}>Chi tiết</div>
            <div
              className={cx("modal-main")}
              style={{ display: "flex" }} //padding: "20px 0 30px 0px"
            >
              <div className={cx("container")}>
                <div
                  className={cx("image")}
                  style={{
                    minHeight: "300px",
                    width: "100%",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  {modalData.images.map((image, index) => (
                    <div
                      key={index}
                      className={cx("img-slider")}
                      style={{
                        width: "100%",
                        transform: `translateX(-${100 * imageIndex}%)`,
                        transition: "transform 0.2s",
                        display: "flex",
                        flexShrink: "0",
                        flexGrow: "0",
                        borderRadius: "0px 0px 10px 10px",
                      }}
                      aria-hidden={imageIndex !== index}
                    >
                      <img
                        style={{
                          width: "100%",
                          objectFit: "contain",
                          height: "auto",
                          display: "block",
                          flexShrink: "0",
                          flexGrow: "0",
                        }}
                        src={getStudentsImageSource(image)}
                        alt={"Ảnh đính kèm"}
                      />

                      {isFirstImage === true ||
                      modalData.images.length === 1 ? null : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={showPrevImage}
                            className={cx("img-slider-btn")}
                            style={{ left: 10 }}
                            aria-label="View Previous Image"
                          >
                            <ArrowBackIosNewIcon
                              style={{
                                width: "16px",
                                height: "16px",
                                marginBottom: "2px",
                              }}
                              aria-hidden
                            />
                          </button>
                        </div>
                      )}
                      {isLastImage === true ||
                      modalData.images.length === 1 ? null : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={showNextImage}
                            className={cx("img-slider-btn")}
                            style={{ right: 10 }}
                            aria-label="View Next Image"
                          >
                            <ArrowForwardIosIcon
                              style={{
                                width: "16px",
                                height: "16px",
                                marginBottom: "2px",
                              }}
                              aria-hidden
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div
                  className={cx("post-caption")}
                  style={{ position: "relative" }}
                >
                  <div className={cx("info")}>
                    <div className={cx("title")}>Phòng:</div>
                    <span id="inspector_id" className={cx("input-span")}>
                      {modalData?.time.room.room_name}
                    </span>
                  </div>
                  <div className={cx("info")}>
                    <div className={cx("title")}>Mã môn thi:</div>
                    <span id="inspector_id" className={cx("input-span")}>
                      {modalData?.time.subject.subject_id}
                    </span>
                  </div>

                  <div className={cx("info")}>
                    <div className={cx("title")}>Loại báo cáo:</div>
                    <span id="inspector_id" className={cx("input-span")}>
                      {modalData?.report_type}
                    </span>
                  </div>
                  <div className={cx("info")}>
                    <div className={cx("title")}>Ca thi:</div>
                    <span id="inspector_id" className={cx("input-span")}>
                      {formatHour(modalData?.time.start_time)}
                    </span>
                  </div>
                  <div className={cx("info")}>
                    <div className={cx("title")}>Ngày thi:</div>
                    <span id="inspector_id" className={cx("input-span")}>
                      {formatDate(modalData?.time.start_time)}
                    </span>
                  </div>
                  <div
                    className={cx("info")}
                    style={{ flexDirection: "column" }}
                  >
                    <div className={cx("title")}>Ghi chú:</div>
                    <textarea
                      readOnly
                      value={modalData?.note}
                      id="inspector_id"
                    >
                      {modalData?.note}
                    </textarea>
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
