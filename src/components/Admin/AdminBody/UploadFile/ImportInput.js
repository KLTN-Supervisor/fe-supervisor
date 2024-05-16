import { useEffect, useRef, useState } from "react";
import { Button, Menu, MenuItem, Stack, SvgIcon } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

const ImportInput = ({
  file,
  setFile,
  fileIsValid,
  setFileIsValid,
  removeFile = () => {},
  uploadHandler = () => {},
  acceptFile = "",
  buttonName = "Import",
  uploadType = [],
}) => {
  const filePickerRef = useRef();
  const [uploadHandlerIndex, setUploadHandlerIndex] = useState(
    uploadType.length > 0 ? 0 : -1
  );

  const [accept, setAccept] = useState("");

  const pickFileHandler = (e) => {
    let pickedFile;

    if (e.target.files && e.target.files.length === 1) {
      pickedFile = e.target.files[0];
      setFile(pickedFile);
      setFileIsValid(true);
    } else {
      setFileIsValid(false);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // useEffect(() => {
  //   setAccept(uploadType[uploadHandlerIndex].acceptFile);
  // }, [uploadHandlerIndex]);

  return (
    <>
      <Stack alignItems="center" direction="row" spacing={1}>
        <Button
          color="success"
          startIcon={
            <SvgIcon fontSize="small">
              <UploadOutlinedIcon />
            </SvgIcon>
          }
          variant="contained"
          onClick={
            uploadType.length > 0
              ? handleClick
              : () => filePickerRef.current.click()
          }
        >
          {buttonName}
        </Button>
        <input
          id="inputFile"
          ref={filePickerRef}
          type="file"
          style={{ display: "none" }}
          //accept={uploadType.length > 0 ? accept : acceptFile}
          onChange={pickFileHandler}
        />
        {file && (
          <>
            <span>{file.name}</span>
            <Button
              onClick={
                uploadType.length > 0
                  ? uploadType[uploadHandlerIndex].uploadHandler
                  : uploadHandler
              }
              // startIcon={
              //   <SvgIcon fontSize="small">
              //     <VerticalAlignTopOutlinedIcon />
              //   </SvgIcon>
              // }
              variant="contained"
              sx={{
                background: "green",
                marginRight: 5,
                ":hover": { background: "green", opacity: 0.7 },
                fontSize: 8,
              }}
              disabled={!fileIsValid}
            >
              Upload
            </Button>

            <Button
              onClick={removeFile}
              // startIcon={
              //   <SvgIcon fontSize="small">
              //     <RemoveCircleOutlineIcon />
              //   </SvgIcon>
              // }
              variant="contained"
              sx={{
                background: "red",
                marginRight: 5,
                ":hover": { background: "red", opacity: 0.7 },
                fontSize: 8,
              }}
            >
              Remove
            </Button>
          </>
        )}
      </Stack>
      {uploadType.length > 0 && (
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
          {uploadType.map((item, i) => (
            <MenuItem
              key={item.name}
              onClick={() => {
                setUploadHandlerIndex(i);
                filePickerRef.current.click();
              }}
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default ImportInput;
