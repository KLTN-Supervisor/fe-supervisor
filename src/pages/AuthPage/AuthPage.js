import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Auth.module.scss";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilledInput from "@mui/material/FilledInput";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import useHttpClient from "../../hooks/http-hook/public-http-hook";
import useAuth from "../../hooks/auth-hook/auth-hook";
import { useLocation, useNavigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import useAccountServices from "../../services/useAccountServices";
const cx = classNames.bind(styles);

const AuthPage = () => {
  const { auth, persist, setAuth, setUserLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = "/";

  const { login, getLoginAccount } = useAccountServices();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () =>
    setShowPassword((showPassword) => !showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [inputError, setInputError] = useState({
    usernameError: false,
    passwordError: false,
  });

  // const [isTouched, setIsTouched] = useState({
  //   username: false,
  //   password: false,
  // });

  // useEffect(() => {
  //   const persisting = JSON.parse(localStorage.getItem("persist") || false);
  //   if (persisting) navigate(from, { replace: true });
  // }, []);

  // useEffect(() => {
  //   return validateInput();
  // }, [formData.username, formData.password, isTouched]);

  const [formValid, setFormValid] = useState();

  const validateInput = (e) => {
    switch (e.target.id) {
      case "username":
        setInputError((prev) => ({
          ...prev,
          usernameError: !e.target.value,
        }));
        break;
      case "password":
        setInputError((prev) => ({
          ...prev,
          passwordError: !e.target.value,
        }));
        break;
    }
  };

  const changeHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
    // setIsTouched((prev) => ({
    //   ...prev,
    //   [e.target.id]: true,
    // }));
    validateInput(e);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputError.usernameError || !formData.username) {
      setFormValid("Tên tài khoản không được để trống!");
      return;
    }
    if (inputError.passwordError || !formData.password) {
      setFormValid("Mật khẩu không được để trống!");
      return;
    }
    setFormValid(null);
    setIsLoading(true);
    try {
      const response = await login(formData.username, formData.password);
      if (response) {
        const userResponse = await getLoginAccount();
        const user = userResponse.user;
        if (user) {
          setUserLogin(user);
          user.role === "ADMIN"
            ? navigate("/administrator/report", { replace: true })
            : user.role === "ACADEMIC_AFFAIRS_OFFICE"
            ? navigate("/administrator/exam-schedules", { replace: true })
            : navigate("/", { replace: true });
          setError(null);
        } else setFormValid("Đăng nhập không thành công, hãy thử lại sau!");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <div
        className={cx("main")}
        style={{ filter: isLoading ? "brightness(90%)" : "brightness(100%)" }}
      >
        {isLoading && <LinearProgress />}
        <Paper elevation={0} square className={cx("center-screen")}>
          <div className={cx("logo--container")}>
            <div
              aria-disabled="false"
              role="button"
              tabIndex={0}
              className={cx("cursor")}
            >
              <i
                data-visualcompletion="css-img"
                role="img"
                aria-label="Instagram"
                className={cx("logo--main")}
              ></i>
            </div>
          </div>
          <div className={cx("form--container")}>
            <form className={cx("form--main")} onKeyDown={handleKeyPress}>
              <div className={cx("form--separate")}>
                <div className={cx("input--margin")}>
                  <div className={cx("input--container")}>
                    <TextField
                      error={inputError.usernameError}
                      id="username"
                      label="Tên đăng nhập"
                      variant="filled"
                      fullWidth={true}
                      size="small"
                      onChange={changeHandler}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className={cx("input--margin")}>
                  <div className={cx("input--container")}>
                    <FormControl
                      error={inputError.passwordError}
                      size="small"
                      fullWidth={true}
                      variant="filled"
                    >
                      <InputLabel htmlFor="password">Mật khẩu</InputLabel>
                      <FilledInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        onChange={changeHandler}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </div>
                </div>
                <div className={cx("button--container")}>
                  <Button
                    onClick={handleSubmit}
                    fullWidth
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: "#03a9f4" }}
                    disabled={isLoading}
                  >
                    <div className={cx("button--text")}>Đăng nhập</div>
                  </Button>
                </div>
                <div className={cx("input--margin")}>
                  {formValid && !error ? (
                    <Alert severity="error">{formValid}</Alert>
                  ) : (
                    error && <Alert severity="error">{error}</Alert>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default AuthPage;
