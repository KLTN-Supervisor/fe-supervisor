import { useRef } from "react";
import { Button, Stack, SvgIcon } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

const ImportInput = ({
  file,
  setFile,
  fileIsValid,
  setFileIsValid,
  removeFile,
  uploadHandler,
}) => {
  const filePickerRef = useRef();

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

  return (
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
        Import
      </Button>
      <input
        id="inputFile"
        ref={filePickerRef}
        type="file"
        style={{ display: "none" }}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={pickFileHandler}
      />
      {file && (
        <>
          <span>{file.name}</span>
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
  );
};

export default ImportInput;
