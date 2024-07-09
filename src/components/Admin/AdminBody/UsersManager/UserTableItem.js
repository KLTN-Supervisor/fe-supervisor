import { format, parseISO } from "date-fns";
import {
  Alert,
  Avatar,
  Checkbox,
  Menu,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames/bind";
import styles from "./UserTableItem.scss";
import { getInitials } from "../../../../untils/get-initials";
import { useState } from "react";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import { getStudentsImageSource } from "../../../../untils/getImageSource";

const cx = classNames.bind(styles);

const UserTableItem = (props) => {
  const {
    user,
    onDeselectOne,
    onSelectOne,
    selected = [],
    handleOnClick = () => {},
  } = props;

  const { getUserReportsCount } = useAdminServices();

  const [viewReports, setViewReports] = useState(false);
  const privateHttpRequest = usePrivateHttpClient();

  const [reportsCount, setReportsCount] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isSelected = selected.includes(user._id);
  const createdAt = format(parseISO(user.created_at), "hh:mm dd/MM/yyyy");

  const loadReportsCount = async () => {
    try {
      const response = await getUserReportsCount(user._id);
      if (response) {
        setReportsCount(response.reports_group_count);
        if (anchorEl) handleClose();
        setViewReports(true);
      }
    } catch (err) {
      console.error("Error loading reports: ", err);
    }
  };

  const userRole = {
    USER: "Thanh tra",
    ADMIN: "Quản trị",
    ACADEMIC_AFFAIRS_OFFICE: "PĐT",
  };

  return (
    <>
      <TableRow hover key={user._id} selected={isSelected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectOne?.(user._id);
              } else {
                onDeselectOne?.(user._id);
              }
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            handleOnClick(user);
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Avatar src={getStudentsImageSource(user.avatar)}>
              {getInitials(user.username)}
            </Avatar>
          </Stack>
        </TableCell>
        <TableCell
          onClick={() => {
            handleOnClick(user);
          }}
        >
          {user.username}
        </TableCell>
        <TableCell
          onClick={() => {
            handleOnClick(user);
          }}
        >
          {user.full_name}
        </TableCell>
        <TableCell
          onClick={() => {
            handleOnClick(user);
          }}
        >
          {userRole[user.role]}
        </TableCell>
        <TableCell
          onClick={() => {
            handleOnClick(user);
          }}
        >
          {createdAt}
        </TableCell>
        <TableCell
          style={{ color: user.banned ? "red" : "green" }}
          onClick={() => {
            handleOnClick(user);
          }}
        >
          {user.banned ? "Bị khóa" : "Còn hoạt động"}
        </TableCell>
        {/* <TableCell
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={user.reports_count > 0 ? handleClick : null}
          style={{
            color:
              user.reports_count < 5
                ? "inherit"
                : user.reports_count >= 5 && user.reports_count < 10
                ? "yellow"
                : user.reports_count >= 10 && user.reports_count < 15
                ? "orange"
                : "red",
          }}
        >
          {user.reports_count}
        </TableCell> */}
      </TableRow>
      {/* <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {user.reports_count > 0 && (
          <MenuItem onClick={loadReportsCount}>View reports</MenuItem>
        )}
      </Menu> */}

      {/* <Modal
        show={viewReports}
        onHide={() => setViewReports(false)}
        className={cx("add-employee-modal")}
      >
        <Modal.Header>
          <div className={cx("title-modal")}>REPORTS</div>
          {privateHttpRequest.error && (
            <>
              <br />
              <div className={cx("title-modal")}>
                <Alert severity="error">{privateHttpRequest.error}</Alert>
              </div>
            </>
          )}
        </Modal.Header>
        <Modal.Body>
          {reportsCount.map((item, i) => (
            <div
              key={i}
              className={cx("row align-items-center", "modal-content-report")}
            >
              <div className={cx("col-lg-8 col-md-8", "report")}>
                {item.reason}
              </div>
              <div className={cx("col-lg-3 col-md-3", "count")}>
                {item.count}
              </div>
            </div>
          ))}
        </Modal.Body>
      </Modal> */}
    </>
  );
};

export default UserTableItem;
