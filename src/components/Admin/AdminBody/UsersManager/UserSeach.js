import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";

export const UserSearch = ({ setSearch }) => {
  const handleSearch = (event) => {
    if (event.key === "Enter") setSearch(event.target.value);
  };

  return (
    <Card sx={{ p: 1.5 }}>
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Tên đăng nhập, tên...."
        inputProps={{
          sx: {
            p: 1.5
          }
        }}
        onKeyUp={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon
              color="action"
              // fontSize="small"
            >
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        }
      />
    </Card>
  );
};

UserSearch.propTypes = {
  setSearch: PropTypes.func,
};
