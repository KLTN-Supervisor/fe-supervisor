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
import { Scrollbar } from "./ScrollBar";
import { useMemo } from "react";
import { applyPagination } from "../../../../untils/apply-pagination";
import { useSelection } from "../../../../hooks/use-selection";
import UserTableItem from "./UserTableItem";

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
    rowsPerPage = -1,
    setUsersSelected,
    selected = [],
    handleOnClick = () => {},
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
                <TableCell>Quyền</TableCell>
                <TableCell>Thời gian tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
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
