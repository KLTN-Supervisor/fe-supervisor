import PropTypes from "prop-types";
import {
  // Avatar,
  Box,
  Card,
  Checkbox,
  CircularProgress,
  // Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  // Typography,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Scrollbar } from "./ScrollBar";
import { useMemo, forwardRef, useContext } from "react";
import { applyPagination } from "../../../../untils/apply-pagination";
import { useSelection } from "../../../../hooks/use-selection";
import UserTableItem from "./UserTableItem";

import { Dropdown } from "@mui/base/Dropdown";
import { Menu } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import { styled } from "@mui/system";
import { CssTransition } from "@mui/base/Transitions";
import { PopupContext } from "@mui/base/Unstable_Popup";

const useUsers = (data, page, rowsPerPage) => {
  return useMemo(() => {
    return applyPagination(data, page, rowsPerPage);
  }, [data, page, rowsPerPage]);
};

const useUserIds = (users) => {
  return useMemo(() => {
    return users.map((user) => user._id);
  }, [users]);
};

export const UserTable = (props) => {
  const {
    isLoading,
    count = 0,
    data = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    totalPages = 0,
    rowsPerPage = -1,
    setUsersSelected,
    selected = [],
    handleOnClick = () => {},
    setRoleFilter,
  } = props;

  const users = data;
  const usersIds = useUserIds(users);
  const usersSelection = useSelection(usersIds, setUsersSelected);

  const onDeselectAll = usersSelection.handleDeselectAll;
  const onDeselectOne = usersSelection.handleDeselectOne;
  const onSelectAll = usersSelection.handleSelectAll;
  const onSelectOne = usersSelection.handleSelectOne;

  const selectedSome = selected.length > 0 && selected.length < users.length;
  const selectedAll = users.length > 0 && selected.length === users.length;

  const createHandleMenuClick = (menuItem) => {
    return setRoleFilter(menuItem);
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
                        onSelectAll?.();
                      } else {
                        onDeselectAll?.();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Avatar</TableCell>
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell style={{ alignTtems: "center", display: "flex" }}>
                  Quyền
                  <Dropdown>
                    <MenuButton>
                      <FilterAltIcon />
                    </MenuButton>
                    <Menu slots={{ listbox: AnimatedListbox }}>
                      <MenuItem key={0} onClick={() => setRoleFilter("")}>
                        Đặt lại
                      </MenuItem>
                      <MenuItem key={1} onClick={() => setRoleFilter("USER")}>
                        Thanh tra
                      </MenuItem>
                      <MenuItem key={2} onClick={() => setRoleFilter("ADMIN")}>
                        Quản trị
                      </MenuItem>
                      <MenuItem
                        key={3}
                        onClick={() => setRoleFilter("ACADEMIC_AFFAIRS_OFFICE")}
                      >
                        Phòng đào tạo
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </TableCell>
                <TableCell>Thời gian tạo</TableCell>
                <TableCell>Tình trạng</TableCell>
                {/* <TableCell>Reports</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 && !isLoading
                ? users.map((user) => (
                    <UserTableItem
                      key={user._id}
                      user={user}
                      onDeselectOne={onDeselectOne}
                      onSelectOne={onSelectOne}
                      selected={selected}
                      handleOnClick={handleOnClick}
                    />
                  ))
                : null}
            </TableBody>
          </Table>
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          )}
          {!isLoading && data.length === 0 && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 550,
                  fontFamily: "inherit",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                Chưa có dữ liệu!
              </span>
            </div>
          )}
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
        labelRowsPerPage={"Số dòng mỗi trang"}
        labelDisplayedRows={({ from, to, count, page }) => {
          return `Trang ${page + 1}/${totalPages} | Tổng: ${count}`;
        }}
        showFirstButton={true}
        showLastButton={true}
      />
    </Card>
  );
};

UserTable.propTypes = {
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

const blue = {
  50: "#F0F7FF",
  100: "#C2E0FF",
  200: "#99CCF3",
  300: "#66B2FF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E6",
  700: "#0059B3",
  800: "#004C99",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Listbox = styled("ul")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  box-shadow: 0px 4px 30px ${
    theme.palette.mode === "dark" ? grey[900] : grey[200]
  };
  z-index: 1;

  .closed & {
    opacity: 0;
    transform: scale(0.95, 0.8);
    transition: opacity 200ms ease-in, transform 200ms ease-in;
  }
  
  .open & {
    opacity: 1;
    transform: scale(1, 1);
    transition: opacity 100ms ease-out, transform 100ms cubic-bezier(0.43, 0.29, 0.37, 1.48);
  }

  .placement-top & {
    transform-origin: bottom;
  }

  .placement-bottom & {
    transform-origin: top;
  }
  `
);

const AnimatedListbox = forwardRef(function AnimatedListbox(props, ref) {
  const { ownerState, ...other } = props;
  const popupContext = useContext(PopupContext);

  if (popupContext == null) {
    throw new Error(
      "The `AnimatedListbox` component cannot be rendered outside a `Popup` component"
    );
  }

  const verticalPlacement = popupContext.placement.split("-")[0];

  return (
    <CssTransition
      className={`placement-${verticalPlacement}`}
      enterClassName="open"
      exitClassName="closed"
    >
      <Listbox {...other} ref={ref} />
    </CssTransition>
  );
});

AnimatedListbox.propTypes = {
  ownerState: PropTypes.object.isRequired,
};

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &.${menuItemClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === "dark" ? grey[700] : grey[400]};
  }

  &:hover:not(.${menuItemClasses.disabled}) {
    background-color: ${theme.palette.mode === "dark" ? blue[900] : blue[50]};
    color: ${theme.palette.mode === "dark" ? blue[100] : blue[900]};
  }
  `
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: none;
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  padding: 0;
  height: 24px;
  border-radius: 2px;
  margin-left: 5px;

  &:active {
    background: ${theme.palette.mode === "dark" ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${
      theme.palette.mode === "dark" ? blue[300] : blue[200]
    };
    outline: none;
  }
  `
);
