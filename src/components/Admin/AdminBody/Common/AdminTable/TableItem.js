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

const cx = classNames.bind(styles);

const AdminTableItem = (props) => {
  const {
    item,
    onDeselectOne,
    onSelectOne,
    selected = [],
    colsData = [],
    options = [],
  } = props;

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
              onClick={() => {
                handleClose();
                option.handleClick(item);
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default AdminTableItem;
