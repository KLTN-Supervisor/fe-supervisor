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
import styles3 from "../ReportsManager/ReportModal.module.scss";
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
import DescriptionIcon from "@mui/icons-material/Description";
import CheckIcon from "@mui/icons-material/Check";
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
  TablePagination,
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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";

const cx = classNames.bind(styles);
const cx2 = classNames.bind(styles2);
const cx3 = classNames.bind(styles3);

const useItemIds = (items) => {
  return useMemo(() => {
    return items.map((item) => item._id);
  }, [items]);
};

function ExamSchedules() {
  const {
    uploadExamSchedulesExcelFiles,
    getExamFilesUploaded,
    importExamFromFiles,
    getYears,
    getTerms,
    getDate,
    getBuildings,
    getUploadedFileYears,
    deleteSelectedFiles,
  } = useAdminServices();

  const { user } = useAuth();

  const [modal, setModal] = useState(false);
  const [fileUploadModal, setFileUploadModal] = useState(false);
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

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
          if (!response.includes(currentYear) && currentTerm === 1)
            response.push(currentYear);

          if (!response.includes(currentYear - 1) && currentTerm > 1)
            response.push(currentYear - 1);

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

  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [filesIsValid, setFilesIsValid] = useState();

  const [fileList, setFileList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleUploadProgress = ({ loaded, total }) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[0].loading = Math.floor((loaded / total) * 100);
      return newFiles;
    });
    if (loaded === total) {
      deleteDraftFile(0);
    }
  };

  const uploadExamSchedulesFilesHandler = async () => {
    for (let i = 0; i < files.length; i++) {
      console.log("tải file ", files[i].file);
      const file = files[i].file;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("term", fileFilterTerm);
        formData.append(
          "schoolYear",
          `${fileFilterYear}-${fileFilterYear + 1}`
        );

        const response = await uploadExamSchedulesExcelFiles(
          formData,
          handleUploadProgress,
          "examSchedules"
        );

        if (response) {
          const fileSize =
            file.size < 1024
              ? `${file.size} KB`
              : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
          if (response.uploaded_files.length > 0) {
            const uploadedFile = response.uploaded_files[0];
            setUploadedFiles((prev) => [
              {
                _id: uploadedFile._id,
                name: uploadedFile.file_name,
                size: fileSize,
              },
              ...prev,
            ]);
          }
        }
      } catch (err) {
        console.log("upload file: ", err);
      }
    }
    setShowProgress(false);
  };

  const {
    handleDeselectAll,
    handleDeselectOne,
    handleSelectAll,
    handleSelectOne,
  } = useSelection(useItemIds(fileList), setSelectedFiles);

  const selectedSome =
    selectedFiles.length > 0 && selectedFiles.length < fileList.length;
  const selectedAll =
    fileList.length > 0 && selectedFiles.length === fileList.length;

  const getExamCheduleFileList = useCallback(async () => {
    try {
      const response = await getExamFilesUploaded(
        fileFilterTerm,
        fileFilterYear,
        page,
        rowsPerPage
      );
      if (response) {
        setFileList(response.files);
        setTotalRecords(response.total_files);
        setTotalPages(response.total_pages);
      }
    } catch (err) {
      console.log("get uploaded file: ", err);
    }
  }, [fileFilterYear, fileFilterTerm, page, rowsPerPage]);

  useEffect(() => {
    if (modal) {
      getExamCheduleFileList();
    }
  }, [modal, fileFilterYear, fileFilterTerm, page, rowsPerPage]);

  const handleImportData = async () => {
    try {
      setImportLoading(true);
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
      setImportLoading(false);
    } catch (err) {
      console.log("Đổ dữ liệu: ", err);
      setImportLoading(false);
    }
  };

  const handleDeleteFiles = async () => {
    try {
      setImportLoading(true);
      const response = await toast.promise(
        () => deleteSelectedFiles(selectedFiles),
        {
          pending: "Đang xóa...",
          error: {
            render: ({ data }) => {
              return `${data.message}`;
            },
          },
          success: {
            render: ({ data }) => {
              if (data.failed_deletion_files.length === 0)
                return <span>Xóa thành công!</span>;

              return (
                <div>
                  Có lỗi không xóa được các file sau:
                  <br />
                  {data.failed_deletion_files.map((file) => (
                    <span key={file._id}>
                      - {file.file_name} <br />
                    </span>
                  ))}
                </div>
              );
            },
          },
        }
      );
      if (response) {
        const failedDeletionFileIds = response.failed_deletion_files.map(
          (file) => file._id
        );
        const deletedFileIds = selectedFiles.filter(
          (fileId) => !failedDeletionFileIds.includes(fileId)
        );

        setFileList((prev) =>
          prev.filter((file) => !deletedFileIds.includes(file._id))
        );
        handleDeselectAll?.();
      }
      setImportLoading(false);
    } catch (err) {
      console.log("Lỗi xóa file: ", err);
      setImportLoading(false);
    }
  };

  const toggleModal = () => {
    handleDeselectAll?.();
    setModal(!modal);
  };

  const toggleFileUploadModal = () => {
    if (fileUploadModal) getExamCheduleFileList();
    removeFiles();
    setFileUploadModal(!fileUploadModal);
    setIsDropping(false);
  };

  const handlePageChange = useCallback((event, value) => {
    setPage(value + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const validFile = (file) => {
    // Các định dạng hợp lệ cho Excel và CSV
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    return validTypes.includes(file.type);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const fileInputRef = useRef(null);

  const removeFiles = () => {
    fileInputRef.current.value = null;
    setFiles([]);
    setFilesIsValid(false);
  };

  const deleteDraftFile = (index) => {
    setFiles((prevFile) => prevFile.filter((_, i) => i !== index));
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const dragFiles = event.dataTransfer.files;
    if (dragFiles.length === 0) return;
    for (let i = 0; i < dragFiles.length; i++) {
      if (!validFile(dragFiles[i])) continue;
      if (!files.some((e) => e.name === dragFiles[i].name)) {
        setFiles((prevFile) => [
          ...prevFile,
          {
            name: dragFiles[i].name,
            url: URL.createObjectURL(dragFiles[i]),
            file: dragFiles[i],
            loading: 0,
          },
        ]);
      }
    }
    setShowProgress(true);
    setIsDropping(true);
  };

  const selectFiles = () => {
    fileInputRef.current.click();
  };

  const onFileSelect = (event) => {
    const selectfiles = event.target.files;
    if (selectfiles.length === 0) return;
    for (let i = 0; i < selectfiles.length; i++) {
      if (!validFile(selectfiles[i])) continue;
      if (!files.some((e) => e.name === selectfiles[i].name)) {
        setFiles((prevFile) => [
          ...prevFile,
          {
            name: selectfiles[i].name,
            url: URL.createObjectURL(selectfiles[i]),
            file: selectfiles[i],
            loading: 0,
          },
        ]);
      }
    }
    setShowProgress(true);
    setIsDropping(true);
  };

  useEffect(() => {
    if (showProgress && files.length > 0) {
      uploadExamSchedulesFilesHandler();
    }
  }, [showProgress]);

  return (
    <>
      <Box className={cx("schedulePage")}>
        <div className={cx("schedulePage__content")}>
          <div
            className={cx3("title")}
            style={{ width: "92%", margin: "24px 0 15px" }}
          >
            <h6 className={cx3("text")}>Lịch thi</h6>
          </div>
          <div style={{ width: "92%", marginBottom: 15 }}>
            {/* <ImportInput
            file={file}
            fileIsValid={fileIsValid}
            setFile={setFile}
            setFileIsValid={setFileIsValid}
            removeFile={removeFile}
            uploadHandler={uploadImportExamSchedulesFileHandler}
          /> */}
            {user?.role === "ACADEMIC_AFFAIRS_OFFICE" ? (
              <Button
                color="success"
                startIcon={
                  <SvgIcon fontSize="small">
                    <UploadIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => {
                  setModal(true);
                }}
              >
                Upload lịch thi
              </Button>
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
                  marginRight: 2,
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
                  padding: "0 15px",
                  flex: 0.2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 15,
                    width: "100%",
                  }}
                >
                  {user?.role === "ACADEMIC_AFFAIRS_OFFICE" && (
                    <Button
                      color="success"
                      startIcon={
                        <SvgIcon fontSize="small">
                          <DownloadIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={() => {
                        setFileUploadModal(true);
                      }}
                      sx={{ width: 400, mr: 2 }}
                    >
                      Chọn file
                    </Button>
                  )}
                  <FormControl
                    variant="standard"
                    className={cx("form__select")}
                    sx={{
                      width: 0.9,
                      border: "1px solid rgba(0, 85, 141, 0.5)",
                      padding: "3px 16px",
                      borderRadius: "10px",
                      mr: 2,
                      ml: 0,
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
                          {fileList &&
                            fileList.length > 0 &&
                            fileList.map((row) => {
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
                  <TablePagination
                    component="div"
                    count={totalRecords}
                    onPageChange={handlePageChange}
                    page={page - 1}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10]}
                    labelRowsPerPage={"Số dòng mỗi trang"}
                    labelDisplayedRows={({ from, to, count, page }) => {
                      return `Trang ${page + 1}/${totalPages} | Tổng: ${count}`;
                    }}
                    showFirstButton={true}
                    showLastButton={true}
                  />
                </Card>
                <div
                  style={{
                    width: "80%",
                    margin: "15px auto auto",
                    paddingBottom: 15,
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
                  {selectedFiles.length > 0 && (
                    <>
                      <button
                        className={cx2("button")}
                        style={{
                          backgroundColor: "red",
                        }}
                        onClick={handleDeleteFiles}
                        disabled={importLoading}
                      >
                        Xóa
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {fileUploadModal && (
        <div
          className={cx2("modal active-modal")}
          onDragOver={isDropping ? null : onDragOver}
          onDragLeave={isDropping ? null : onDragLeave}
          onDrop={isDropping ? null : onDrop}
        >
          <div
            onClick={toggleFileUploadModal}
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
          <div className={cx2("modal-navbar-content")} style={{ width: "50%" }}>
            <div className={cx2("modal-header")}>Tải lên file</div>
            <div
              className={cx2("modal-main")}
              style={{
                display: "flex",
                padding: "0 0 10px 0",
                flexDirection: "column",
                maxHeight: "70%",
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  display: "flex",
                  ...(!isDropping && { height: "60vh" }),
                  ...(isDragging && { opacity: 0.6 }),
                }}
              >
                <div className={cx("modal-image")}>
                  <UploadFileIcon className={cx("modal-logo")} />
                </div>
                {isDragging ? (
                  <div className={cx("modal-text")}>Thả file tại đây</div>
                ) : (
                  <div className={cx("modal-text")}>Kéo thả file vào đây</div>
                )}
                <div className={cx("modal-input")}>
                  <input
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    multiple
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    id="myFileInput"
                    style={{ display: "none" }}
                  />
                  <label
                    role="button"
                    onClick={selectFiles}
                    className={cx("modal-upload")}
                    style={{marginBottom: 15}}
                  >
                    Chọn từ thư mục
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: 10,
                    width: "90%",
                    overflow: "visible",
                  }}
                >
                  <section className={cx("loading-area")}>
                    {files.map((objectFile, i) => (
                      <div className={cx("row")} key={i}>
                        <DescriptionIcon style={{ color: "#0086fe" }} />
                        <div className={cx("content-file")}>
                          <div className={cx("details-file")}>
                            <span className={cx("name")}>
                              {`${objectFile.name} - đang tải`}
                            </span>
                            <span
                              className={cx("percent")}
                              style={{ marginLeft: 10, marginRight: 3 }}
                            >
                              {`${objectFile.loading}%`}
                            </span>
                            <div className={cx("loading-bar")}>
                              <div
                                className={cx("loading")}
                                style={{ width: `${objectFile.loading}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>

                  <section className={cx("uploaded-area")}>
                    {uploadedFiles.map((objectFile, i) => (
                      <div className={cx("row")} key={i}>
                        <DescriptionIcon style={{ color: "#0086fe" }} />
                        <div className={cx("content-file")}>
                          <div className={cx("details-file")}>
                            <span className={cx("name")}>
                              {objectFile.name}
                            </span>
                            <span className={cx("size")}>
                              {objectFile.size}
                            </span>
                          </div>
                        </div>
                        <CheckIcon className={cx("check-icon")} />
                        <DeleteIcon
                          className={cx("del-icon")}
                          onClick={() => deleteDraftFile(i)}
                        />
                      </div>
                    ))}
                  </section>
                </div>
              </div>
              <div
                style={{
                  width: "80%",
                  margin: "15px auto auto",
                  paddingBottom: 15,
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
                  onClick={toggleFileUploadModal}
                  disabled={importLoading}
                >
                  Đóng
                </button>
                {files.length > 0 && (
                  <button
                    className={cx2("button")}
                    style={{
                      backgroundColor: "lightgreen",
                    }}
                    onClick={uploadExamSchedulesFilesHandler}
                    disabled={importLoading}
                  >
                    Tải lên
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExamSchedules;
