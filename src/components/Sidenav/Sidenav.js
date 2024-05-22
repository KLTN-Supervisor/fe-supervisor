import React, { useEffect } from "react";
import { useState, useRef, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./Sidenav.module.scss";
import InstagramIcon from "@mui/icons-material/Instagram";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LogoutIcon from '@mui/icons-material/Logout';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useLocation, useNavigate } from "react-router-dom";
import useLogout from "../../hooks/auth-hook/logout-hook";
import NavBarLogo from "../../assets/logo-white.png";
import NavBarIcon from "../../assets/NESTME-2.png";
const cx = classNames.bind(styles);
function Sidenav() {
    const locate = window.location.pathname;
    const { logout } = useLogout();
    const navigate = useNavigate();
    return(
        <div style={{ display: "flex" }}>
            <div className={cx("sidenav")} >
                
                <div
                    className={cx("sidenav__logo__icon")}
                >
                    <img
                    style={{ cursor: "pointer", width: "27px", height: "27px", borderRadius: "5px" }}
                    onClick={() => { 
                        navigate("/", { replace: true });
                    }}
                    className={cx("sidenav__logo")}
                    src={NavBarIcon}
                    alt="NestMe Icon"
                    />
                </div>
                
                <div className={cx("sidenav__title")}>
                    <img
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        navigate("/", { replace: true });
                    }}
                    className={cx("sidenav__logo")}
                    src={NavBarLogo}
                    alt="NestMe Logo"
                    />
                </div>
                
                <div className={cx("sidenav__buttons")}>
                    <button
                        onClick={() => {
                            navigate("/", { replace: true });
                        }}
                        className={cx("sidenav__button")}
                        style={
                            locate === "/"
                            ? { background: "rgba(255, 255, 255, 0.128)" }
                            : null
                        }
                    >
                        {locate === "/" ? (
                        <HomeIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        ) : (
                        <HomeOutlinedIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        )}
                        <span className={cx("span")}>Trang chủ</span>
                    </button>
                    <button
                        className={cx("sidenav__button")}
                        onClick={() => {
                                navigate("/searchExamSchedule", { replace: true });
                            }}
                            style={
                                locate === "/searchExamSchedule"
                                ? { background: "rgba(255, 255, 255, 0.128)" }
                                : null
                            }
                    >
                        <SearchIcon
                        className={cx("sidenav__icon")}
                        style={{ width: "27px", height: "27px", fontWeight: "900" }}
                        />
                        <span className={cx("span")}>Tra cứu phòng thi</span>
                    </button>
                    <button
                        onClick={() => {
                            navigate("/searchStudent", { replace: true });
                        }}
                        className={cx("sidenav__button")}
                        style={
                            locate === "/searchStudent"
                            ? { background: "rgba(255, 255, 255, 0.128)" }
                            : null
                        }
                    >
                        {locate === "/searchStudent" ? (
                        <GroupsIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        ) : (
                        <GroupsOutlinedIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        )}

                       <span className={cx("span")}>Tra cứu sinh viên</span>
                    </button>
                    <div className={cx("sidenav__more")}>
                        <button
                            className={cx("sidenav__button")}
                            onClick={() => {
                                navigate("/searchStudent", { replace: true });
                            }}
                        >
                            <LogoutIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                            />        
                            <span className={cx("sidenav__buttonText span")}>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
    
}

export default Sidenav;