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
import { getInitials } from "../../../../../untils/get-initials";
import { useState } from "react";
import useAdminServices from "../../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../../hooks/http-hook/private-http-hook";
import styles from "./TableItem.scss";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "../../../../../untils/format-date";

const cx = classNames.bind(styles);

const AdminTableItem = (props) => {
  const {
    item,
    onDeselectOne,
    onSelectOne,
    selected = [],
    colsData = [],
    options = [],
    renderModalBody,
  } = props;

  const [viewReports, setViewReports] = useState(false);
  const privateHttpRequest = usePrivateHttpClient();

  const [reportsCount, setReportsCount] = useState([]);

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    // if (document.body.style.overflow !== "hidden") {
    //   document.body.style.overflow = "hidden";
    // } else {
    //   document.body.style.overflow = "auto";
    // }
    handleClose();
    setModal(!modal);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isSelected = selected.includes(item._id);
  const createdAt = format(parseISO(item.created_at), "dd/MM/yyyy");

  // const loadReportsCount = async () => {
  //   try {
  //     const response = await getUserReportsCount(
  //       user._id,
  //       privateHttpRequest.privateRequest
  //     );
  //     if (response) {
  //       setReportsCount(response.reports_group_count);
  //       if (anchorEl) handleClose();
  //       setViewReports(true);
  //     }
  //   } catch (err) {
  //     console.error("Error loading reports: ", err);
  //   }
  // };

  return (
    <>
      <TableRow
        hover
        key={item._id}
        selected={isSelected}
        onClick={handleClick}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectOne?.(item._id);
              } else {
                onDeselectOne?.(item._id);
              }
            }}
          />
        </TableCell>
        {/* <TableCell>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Avatar src={user.profile_picture}>
              {getInitials(user.username)}
            </Avatar>
            <Typography variant="subtitle2">{user.username}</Typography>
          </Stack>
          
        </TableCell> */}
        {colsData.map((key) => (
          <TableCell key={key}>{item[key]}</TableCell>
        ))}

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
      {options.length > 0 && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          sx={{ width: 400 }}
        >
          {options.map((option, i) => (
            <MenuItem
              onClick={
                option.handleClick === "toggleModal"
                  ? toggleModal
                  : option.handleClick
              }
            >
              {option.name}
            </MenuItem>
          ))}
        </Menu>
      )}

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
          {renderModalBody(item, toggleModal)}
        </div>
      )}
    </>
  );
};

export default AdminTableItem;
