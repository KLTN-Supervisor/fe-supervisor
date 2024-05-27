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
import styles from "./ReportTableItem.scss";
import { getInitials } from "../../../../untils/get-initials";
import { useState } from "react";
import useAdminServices from "../../../../services/useAdminServices";
import usePrivateHttpClient from "../../../../hooks/http-hook/private-http-hook";
import { formatHour, formatDate } from "../../../../untils/format-date";

const cx = classNames.bind(styles);

const ReportTableItem = (props) => {
  const { user, selected = [], handleOnClick = () => {} } = props;

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
  const createdAt = format(parseISO(user.created_at), "dd/MM/yyyy");

  return (
    <TableRow
      hover
      key={user._id}
      selected={isSelected}
      onClick={() => {
        handleOnClick(user);
      }}
    >
      <TableCell>{user.time.room.room_name}</TableCell>
      <TableCell>{user.report_type}</TableCell>
      <TableCell>{user.note}</TableCell>
      <TableCell>{formatHour(user.time.start_time)}</TableCell>
      <TableCell>{formatDate(user.time.start_time)}</TableCell>
    </TableRow>
  );
};

export default ReportTableItem;
