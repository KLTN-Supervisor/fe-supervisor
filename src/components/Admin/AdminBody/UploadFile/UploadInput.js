import { useEffect, useRef, useState } from "react";
import { Button, Menu, MenuItem, Stack, SvgIcon } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

const UploadInput = ({
  files,
  setFiles,
  fileIsValid,
  setFileIsValid,
  removeFile = () => {},
  uploadHandler = () => {},
  acceptFile = ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
  buttonName = "Upload",
  uploadType = [],
}) => {
  const filePickerRef = useRef();
  const [uploadHandlerIndex, setUploadHandlerIndex] = useState(
    uploadType.length > 0 ? 0 : -1
  );

  const [accept, setAccept] = useState("");

  const pickFilesHandler = (e) => {
    let pickedFiles;

    if (e.target.files && e.target.files.length >= 1) {
      pickedFiles = Array.from(e.target.files);
      console.log(pickedFiles);
      setFiles(pickedFiles);
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

  useEffect(() => {
    if (!files || files.length === 0) filePickerRef.current.value = null;
  }, [files]);

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
          hidden
          multiple
          accept={acceptFile}
          onChange={pickFilesHandler}
        />
        {files && files.length > 0 && (
          <>
            {/* {files.map((file, i) => (
              <span>{file.name}</span>
            ))} */}

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

export default UploadInput;
