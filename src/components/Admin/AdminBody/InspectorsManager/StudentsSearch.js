import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";

export const StudentsSearch = ({ setSearch }) => {
  const handleSearch = (event) => {
    if (event.key === "Enter") setSearch(event.target.value);
  };

  return (
    <Card sx={{ p: 1.5 }}>
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Mã thanh tra, họ tên...."
        onKeyUp={handleSearch}
        inputProps={{
          sx: {
            p: 1.5
          }
        }}
        startAdornment={
          <InputAdornment position="start"  sizeSmall>
            <SvgIcon
              color="action"
            >
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        }
      />
    </Card>
  );
};

StudentsSearch.propTypes = {
  setSearch: PropTypes.func,
};
