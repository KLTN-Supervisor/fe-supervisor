import PropTypes from "prop-types";
import {
  // Avatar,
  Box,
  Card,
  Checkbox,
  // Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  // Typography,
} from "@mui/material";
import { Scrollbar } from "../../UsersManager/ScrollBar";
import { useMemo } from "react";
import { applyPagination } from "../../../../../untils/apply-pagination";
import { useSelection } from "../../../../../hooks/use-selection";
import AdminTableItem from "./TableItem";
import styles from "../../../../Supervisor/StudentCard/StudentCard.module.scss";
import { formatDate } from "../../../../../untils/format-date";
import classNames from "classnames/bind";
import { getStudentsImageSource } from "../../../../../untils/getImageSource";

const cx = classNames.bind(styles);

const useItemIds = (items) => {
  return useMemo(() => {
    return items.map((item) => item._id);
  }, [items]);
};

export const AdminTable = (props) => {
  const {
    count = 0,
    data = [],
    onPageChange = () => {},
    onRowsPerPageChange = () => {},
    page = 0,
    rowsPerPage = -1,
    setItemsSelected,
    selected = [],
    colsName = [],
    colsData = [],
  } = props;

  const itemIds = useItemIds(data);
  const {
    handleDeselectAll,
    handleDeselectOne,
    handleSelectAll,
    handleSelectOne,
  } = useSelection(itemIds, setItemsSelected);

  const selectedSome = selected.length > 0 && selected.length < data.length;
  const selectedAll = data.length > 0 && selected.length === data.length;

  const renderModalBody = (item, toggleModal) => {
    return (
      <div
        className={cx("modal-navbar-content")}
        style={{ width: "50%", marginTop: 30 }}
      >
        <div className={cx("modal-header")}>Thông tin sinh viên</div>
        <div className={cx("modal-main")}>
          <div style={{ height: "250px" }}>
            <img
              style={{ width: "100%", maxHeight: "250px" }}
              src={getStudentsImageSource(item.portrait_img)}
            />
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>MSSV:</div>
            <span className={cx("span")}>{item.student_id}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Họ và tên:</div>
            <span className={cx("span")}>{item.fullname}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>CMND/CCCD:</div>
            <span className={cx("span")}>
              {item.citizen_identification_number}
            </span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Giới tính:</div>
            <span className={cx("span")}>{item.gender}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Ngày sinh:</div>
            <span className={cx("span")}>{formatDate(item.date_of_birth)}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Nơi sinh:</div>
            <span className={cx("span")}>{item.place_of_birth}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Tỉnh/TP:</div>
            <span className={cx("span")}>
              {item.permanent_address.city_or_province}
            </span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Quận/huyện:</div>
            <span className={cx("span")}>
              {item.permanent_address.district}
            </span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Địa chỉ thường trú:</div>
            <span className={cx("span")}>{item.permanent_address.address}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Quốc tịch:</div>
            <span className={cx("span")}>{item.nationality}</span>
          </div>
          <div className={cx("info")}>
            <div className={cx("title")}>Lớp học phần:</div>
            <span className={cx("span")}>{item.class}</span>
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
              className={cx("button")}
              style={{
                backgroundColor: "lightpink",
              }}
              onClick={toggleModal}
            >
              Đóng
            </button>
            <button
              className={cx("button")}
              style={{
                backgroundColor: "lightgreen",
              }}
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
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
                {colsName.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <AdminTableItem
                  key={row._id}
                  item={row}
                  onDeselectOne={handleDeselectOne}
                  onSelectOne={handleSelectOne}
                  selected={selected}
                  colsData={colsData}
                  options={[
                    { name: "More information", handleClick: "toggleModal" },
                  ]}
                  renderModalBody={renderModalBody}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 15, 30]}
      />
    </Card>
  );
};

AdminTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
  setUsersSelected: PropTypes.func,
};
