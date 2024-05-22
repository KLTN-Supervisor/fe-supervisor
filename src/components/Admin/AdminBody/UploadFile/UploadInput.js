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
}) => {
  const filePickerRef = useRef();

  const pickFilesHandler = (e) => {
    let pickedFiles;

    if (e.target.files) {
      pickedFiles = Array.from(e.target.files);
      setFiles(pickedFiles);
      setFileIsValid(true);
    } else {
      setFileIsValid(false);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!files || files.length === 0) filePickerRef.current.value = null;
  }, [files]);

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
          onClick={() => filePickerRef.current.click()}
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
            {files.map((file, i) => (
              <span>{file.name}</span>
            ))}

            <Button
              onClick={uploadHandler}
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
    </>
  );
};

export default UploadInput;
