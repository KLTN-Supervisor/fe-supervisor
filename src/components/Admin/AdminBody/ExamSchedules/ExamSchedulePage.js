import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import classNames from "classnames/bind";
import styles from "./ExamSchedulePage.module.scss";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Building from "../../../../components/Supervisor/Building";
import useExamScheduleServices from "../../../../services/useExamScheduleServices";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../untils/format-date";
import ImportInput from "../UploadFile/ImportInput";
import useAdminServices from "../../../../services/useAdminServices";
import UploadInput from "../UploadFile/UploadInput";
import {
  Box,
  Button,
  Card,
  Checkbox,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Modal from "react-bootstrap/Modal";
import { Scrollbar } from "../UsersManager/ScrollBar";
import { format, parseISO } from "date-fns";
import { useSelection } from "../../../../hooks/use-selection";
import DownloadIcon from "@mui/icons-material/Download";
import useAuth from "../../../../hooks/auth-hook/auth-hook";
import { toast } from "react-toastify";
import { formatHour } from "../../../../untils/format-date";
import styles2 from "../../../Supervisor/StudentCard/StudentCard.module.scss";
import CloseIcon from "@mui/icons-material/Close";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);

const useItemIds = (items) => {
  return useMemo(() => {
    return items.map((item) => item._id);
  }, [items]);
};

function ExamSchedules() {
  const {
    uploadImportFile,
    uploadExamSchedulesExcelFiles,
    getExamFilesUploaded,
    importExamFromFiles,
    getYears,
    getTerms,
    getDate,
    getBuildings,
    getUploadedFileYears,
  } = useAdminServices();

  const { user } = useAuth();

  const [modal, setModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const getCurrentValue = (type) => {
    const today = new Date();
    const month = today.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0 nên cần +1
    const date = today.getDate();
    const currentYear = today.getFullYear();

    const term = (() => {
      if (
        (month === 8 && date >= 15) ||
        (month >= 9 && month <= 12) ||
        (month === 1 && date <= 5)
      ) {
        return 1;
      } else if (
        (month === 1 && date >= 10) ||
        (month >= 2 && month <= 5) ||
        (month === 6 && date <= 10)
      ) {
        return 2;
      } else if (
        (month === 6 && date >= 15) ||
        month === 7 ||
        (month === 8 && date <= 10)
      ) {
        return 3;
      }
    })();

    if (type === "term") {
      return term;
    } else if (type === "year") {
      if (term === 1) {
        return currentYear;
      } else {
        return currentYear - 1;
      }
    }
  };

  const [allTerms, setAllTerms] = useState([1, 2, 3]);
  const [currentTerm, setCurrentTerm] = useState(() => getCurrentValue("term"));
  const [fileFilterTerm, setFileFilterTerm] = useState("");

  const handleFileFilterTermChange = (event) => {
    setFileFilterTerm(event.target.value);
  };

  const [allYears, setAllYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(() => getCurrentValue("year"));
  const [fileFilterYear, setFileFilterYear] = useState("");

  const handleFileFilterYearChange = (event) => {
    setFileFilterYear(event.target.value);
  };

  useEffect(() => {
    setFileFilterTerm(currentTerm);
    setFileFilterYear(currentYear);
  }, [currentTerm, currentYear]);

  const [building, setBuilding] = useState([]);
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
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState("");
  const handleDateChange = (event) => {
    setDate(event.target.value);
  };
  useEffect(() => {
    const getYearExam = async () => {
      setStudentsLoading(true);
      try {
        const response = await getYears();

        setYears(response);
      } catch (err) {
        console.log("get year error: ", err);
      }
    };

    const getAllUploadedFileYears = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await getUploadedFileYears();

        if (response) {
          if (!response.includes(currentYear) && currentTerm === 1) {
            response.push(currentYear);
          }

          setAllYears(response);
        }
      } catch (err) {
        console.log("get file year error: ", err);
      }
    };

    getYearExam();
    getAllUploadedFileYears();
  }, []);

  useEffect(() => {
    const getTermsExam = async () => {
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
    };
    getTermsExam();
  }, [year]);

  useEffect(() => {
    const getDatesExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getDate(year, term);
          console.log(response);

          // Tạo một Set để lưu trữ các ngày không trùng nhau
          const uniqueDatesSet = new Set();

          // Lặp qua mảng datetime và lấy ngày từ mỗi mục
          response.forEach((datetime) => {
            const date = new Date(datetime).toISOString().split("T")[0];
            const dateFormat = formatDate(date);
            uniqueDatesSet.add(dateFormat);
          });

          // Chuyển Set thành mảng
          const uniqueDatesArray = Array.from(uniqueDatesSet);
          setDates(uniqueDatesArray);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get date error: ", err);
        }
      }
    };
    getDatesExam();
  }, [term]);

  useEffect(() => {
    const getBuildingsExam = async () => {
      if (!studentsLoading) {
        setStudentsLoading(true);
        try {
          const response = await getBuildings(date);
          setBuilding(response);
          setStudentsLoading(false);
        } catch (err) {
          setStudentsLoading(false);
          console.log("get year error: ", err);
        }
      }
    };
    getBuildingsExam();
  }, [date]);

  const [files, setFiles] = useState();
  const [filesIsValid, setFilesIsValid] = useState();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const removeFiles = () => {
    setFiles(null);
    setFilesIsValid(false);
  };

  const uploadExamSchedulesFilesHandler = async () => {
    try {
      const formData = new FormData();
      files.map((file, i) => formData.append("file", file));
      const response = await uploadExamSchedulesExcelFiles(
        formData,
        "examSchedules"
      );
      if (response) {
        removeFiles();
      }
    } catch (err) {
      console.log("upload file: ", err);
    }
  };

  const {
    handleDeselectAll,
    handleDeselectOne,
    handleSelectAll,
    handleSelectOne,
  } = useSelection(useItemIds(uploadedFiles), setSelectedFiles);

  const selectedSome =
    selectedFiles.length > 0 && selectedFiles.length < uploadedFiles.length;
  const selectedAll =
    uploadedFiles.length > 0 && selectedFiles.length === uploadedFiles.length;

  const getUploadedFiles = useCallback(async () => {
    try {
      const response = await getExamFilesUploaded(
        fileFilterTerm,
        fileFilterYear
      );
      if (response) {
        setUploadedFiles(response.files);
      }
    } catch (err) {
      console.log("get uploaded file: ", err);
    }
  }, [fileFilterYear, fileFilterTerm]);

  useEffect(() => {
    if (modal) {
      getUploadedFiles();
    }
  }, [modal, fileFilterYear, fileFilterTerm]);

  const handleImportData = async () => {
    try {
      const response = await toast.promise(
        () => importExamFromFiles(selectedFiles),
        {
          pending: "Đang đổ dữ liệu...",
          error: {
            render: ({ data }) => {
              return `${data.message}`;
            },
          },
          success: {
            render: ({ data }) => {
              if (data.new_records === 0)
                return (
                  <span>
                    Không có lịch thi mới do toàn bộ bị trùng hoặc file rỗng!
                  </span>
                );
              else if (data.duplicates.length === 0)
                return (
                  <span>
                    Thành công!
                    <br />
                    Không có lịch thi bị trùng
                  </span>
                );
              return (
                <div>
                  Thành công!
                  <br />
                  Các lịch thi bị trùng:
                  <br />
                  {data.duplicates.map((duplicate) => (
                    <span>
                      - Kỳ {duplicate.term} Năm: {duplicate.year.from}-
                      {duplicate.year.to}, Ca {formatHour(duplicate.start_time)}
                      Phòng: {duplicate.room.room_name} <br />
                    </span>
                  ))}
                </div>
              );
            },
          },
        }
      );
      if (response) {
      }
    } catch (err) {
      console.log("Đổ dữ liệu: ", err);
    }
  };

  const toggleModal = () => {
    handleDeselectAll?.();
    setModal(!modal);
  };

  return (
    <>
      <Box className={cx("schedulePage")}>
        <div className={cx("schedulePage__content")}>
          <div style={{ width: "100%" }}>
            {/* <ImportInput
            file={file}
            fileIsValid={fileIsValid}
            setFile={setFile}
            setFileIsValid={setFileIsValid}
            removeFile={removeFile}
            uploadHandler={uploadImportExamSchedulesFileHandler}
          /> */}
            {user?.role === "ACADEMIC_AFFAIRS_OFFICE" ? (
              <UploadInput
                files={files}
                fileIsValid={filesIsValid}
                setFiles={setFiles}
                setFileIsValid={setFilesIsValid}
                removeFile={removeFiles}
                uploadHandler={uploadExamSchedulesFilesHandler}
                buttonName="Tải lên file"
              />
            ) : user?.role === "ADMIN" ? (
              <Button
                color="success"
                startIcon={
                  <SvgIcon fontSize="small">
                    <DownloadIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => {
                  setModal(true);
                }}
              >
                Đổ dữ liệu
              </Button>
            ) : null}
          </div>
          <h1>Tra cứu lịch thi</h1>
          <div className={cx("page_content")}>
            <div className={cx("page_content__header")}>
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
                  sx={{ height: "100%" }}
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
                  marginRight: 5,
                }}
              >
                <Select
                  value={term}
                  onChange={handleTermChange}
                  displayEmpty
                  disableUnderline
                  inputProps={{ "aria-label": "Without label" }}
                  sx={{ height: "100%" }}
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
                  value={date}
                  onChange={handleDateChange}
                  displayEmpty
                  disableUnderline
                  inputProps={{ "aria-label": "Without label" }}
                  sx={{ height: "100%" }}
                >
                  <MenuItem value="">
                    <em>Chọn ngày thi</em>
                  </MenuItem>
                  {dates?.length > 0 &&
                    dates.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            <div className={cx("title")}>
              <h6 className={cx("text")}>Danh sách tòa nhà</h6>
            </div>
            <div className={cx("page_content__body")}>
              <div className={cx("students")}>
                {building?.length > 0 ? (
                  building.map((b) => (
                    <Building key={b._id} building={b} date={date} />
                  ))
                ) : (
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontWeight: 600,
                      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Helvetica, Arial, sans-serif`,
                      color: "rgb(61 60 60)",
                    }}
                  >
                    Không có dữ liệu
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
            style={{ width: "80%", marginTop: 15 }}
          >
            <div className={cx2("modal-header")}>Đổ dữ liệu lịch thi</div>
            <div
              className={cx2("modal-main")}
              style={{ display: "flex", padding: "10px 0 15px 0px" }}
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
                    marginBottom: 5,
                    width: "70%",
                  }}
                >
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
                      value={fileFilterYear}
                      onChange={handleFileFilterYearChange}
                      displayEmpty
                      disableUnderline
                      inputProps={{ "aria-label": "Without label" }}
                      sx={{ height: "100%" }}
                    >
                      {allYears?.length > 0 &&
                        allYears.map((y) => (
                          <MenuItem key={y} value={y}>
                            Năm học {y} - {y + 1}
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
                      marginRight: 5,
                    }}
                  >
                    <Select
                      value={fileFilterTerm}
                      onChange={handleFileFilterTermChange}
                      displayEmpty
                      disableUnderline
                      inputProps={{ "aria-label": "Without label" }}
                      sx={{ height: "100%" }}
                    >
                      {allTerms?.length > 0 &&
                        allTerms.map((t) => (
                          <MenuItem key={t} value={t}>
                            Học kỳ {t}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                <Card sx={{ height: 450 }}>
                  <Scrollbar>
                    <Box sx={{ minWidth: 800 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedAll}
                                indeterminate={selectedSome}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    handleSelectAll?.();
                                  } else {
                                    handleDeselectAll?.();
                                  }
                                }}
                              />
                            </TableCell>

                            <TableCell>Tên file</TableCell>
                            <TableCell>Kỳ</TableCell>
                            <TableCell>Năm học</TableCell>
                            <TableCell>Ngày tải lên</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uploadedFiles &&
                            uploadedFiles.length > 0 &&
                            uploadedFiles.map((row) => {
                              const isSelected = selectedFiles.includes(
                                row._id
                              );
                              return (
                                <TableRow
                                  hover
                                  key={row._id}
                                  selected={isSelected}
                                  //onClick={handleClick}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={(event) => {
                                        if (event.target.checked) {
                                          handleSelectOne?.(row._id);
                                        } else {
                                          handleDeselectOne?.(row._id);
                                        }
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>{row.file_name}</TableCell>
                                  <TableCell>Kỳ {row.term}</TableCell>
                                  <TableCell>
                                    {row.year.from}-{row.year.to}
                                  </TableCell>
                                  <TableCell>
                                    {format(
                                      parseISO(row.created_at),
                                      "hh:MM dd/MM/yyyy"
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {row.has_used ? "Đã đổ" : "Chưa đổ"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </Box>
                  </Scrollbar>
                  {/*<TablePagination
               component="div"
               count={uploadedFiles.length}
               onPageChange={onPageChange}
               onRowsPerPageChange={onRowsPerPageChange}
               page={page - 1}
               rowsPerPage={rowsPerPage}
               rowsPerPageOptions={[10, 15, 30]}
             />  */}
                </Card>
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
                    onClick={toggleModal}
                    disabled={importLoading}
                  >
                    Đóng
                  </button>
                  <button
                    className={cx2("button")}
                    style={{
                      backgroundColor: "lightgreen",
                    }}
                    onClick={handleImportData}
                    disabled={importLoading}
                  >
                    Đổ dữ liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExamSchedules;
