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
import { Scrollbar } from "../../UsersManager/ScrollBar";
import { useMemo } from "react";
import { applyPagination } from "../../../../../untils/apply-pagination";
import { useSelection } from "../../../../../hooks/use-selection";
import AdminTableItem from "./TableItem";
import styles from "../../../../Supervisor/StudentCard/StudentCard.module.scss";

import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const useItemIds = (items) => {
  return useMemo(() => {
    return items.map((item) => item._id);
  }, [items]);
};

export const AdminTable = (props) => {
  const {
    isLoading,
    count = 0,
    data = [],
    onPageChange = () => {},
    onRowsPerPageChange = () => {},
    page = 0,
    rowsPerPage = -1,
    setItemsSelected = () => {},
    selected = [],
    colsName = [],
    colsData = [],
    onClickItem = () => {},
    hasCheckBox = true,
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

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                {hasCheckBox && (
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
                )}
                {colsName.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 && !isLoading
                ? data.map((row) => (
                    <AdminTableItem
                      key={row._id}
                      item={row}
                      onDeselectOne={handleDeselectOne}
                      onSelectOne={handleSelectOne}
                      selected={selected}
                      colsData={colsData}
                      options={[
                        { name: "Xem thông tin", handleClick: onClickItem },
                      ]}
                      hasCheckBox={hasCheckBox}
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
