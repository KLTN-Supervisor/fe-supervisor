import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";

export const StudentsSearch = ({ setSearch }) => {
  const handleSearch = (event) => {
    if (event.key === "Enter") setSearch(event.target.value);
    else if (event.target.value === "") setSearch(event.target.value);
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Tên, mã sinh viên...."
        onKeyUp={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon
              color="action"
              //fontSize="small"
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
