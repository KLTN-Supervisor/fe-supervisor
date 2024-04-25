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
import TableItem from "./TableItem";

const useItemIds = (items) => {
  return useMemo(() => {
    return items.map((item) => item._id);
  }, [items]);
};

export const Table = (props) => {
  const {
    count = 0,
    data = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = -1,
    setItemsSelected,
    selected = [],
    colsName = [],
    colsData = [],
  } = props;

  const itemIds = useItemIds(data);
  const itemsSelection = useSelection(itemIds, setItemsSelected);

  const onDeselectAll = itemsSelection.handleDeselectAll;
  const onDeselectOne = itemsSelection.handleDeselectOne;
  const onSelectAll = itemsSelection.handleSelectAll;
  const onSelectOne = itemsSelection.handleSelectOne;

  const selectedSome = selected.length > 0 && selected.length < data.length;
  const selectedAll = data.length > 0 && selected.length === data.length;

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
                {colsName.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableItem
                  key={row._id}
                  user={row}
                  onDeselectOne={onDeselectOne}
                  onSelectOne={onSelectOne}
                  selected={selected}
                  colsData={colsData}
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

Table.propTypes = {
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
