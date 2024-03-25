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
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DensityMediumOutlinedIcon from "@mui/icons-material/DensityMediumOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { StateContext } from "../../context/StateContext";
import useLogout from "../../hooks/auth-hook/logout-hook";
import NavBarLogo from "../../assets/logo-white.png";

const cx = classNames.bind(styles);
function Sidenav({ onScrollToTop }) {
    const locate = window.location.pathname;
    const { logout } = useLogout();
    const navigate = useNavigate();
    const [open, setOpen] = useState("");
    return(
        <div style={{ display: "flex" }}>
            <div className={cx("sidenav")} style={open ? { width: "80px" } : null}>
                {open ? (
                    <div
                        style={{
                        height: "120px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        }}
                    >
                        <button
                        className={cx("sidenav__button")}
                        onClick={() => {
                            navigate("/", { replace: true });
                        }}
                        style={
                            open ? { width: "71%", margin: "5px 13px 8px 10px" } : null
                        }
                        >
                        <InstagramIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        </button>
                    </div>
                    ) : (
                    <div className={cx("sidenav__title")}>
                        <img
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate("/", { replace: true });
                        }}
                        className={cx("sidenav__logo")}
                        src={NavBarLogo}
                        alt="Instagram Logo"
                        />
                    </div>
                    )}

                    <div className={cx("sidenav__buttons")}>
                    <button
                        onClick={() => {
                        navigate("/", { replace: true });
                        }}
                        className={cx("sidenav__button")}
                        style={
                        open
                            ? { width: "71%", margin: "5px 10px 5px 10px" }
                            : locate === "/"
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
                        {open ? null : <span className={cx("span")}>Home</span>}
                    </button>
                    <button
                        className={cx("sidenav__button")}
                        onClick={() => {
                            navigate("/search", { replace: true });
                            }}
                        style={Object.assign(
                        {},
                        open ? { width: "71%", margin: "5px 10px 5px 10px" } : {},
                        open === "Search" ? { background: "rgba(255, 255, 255, 0.128)" } : {}
                        )}
                    >
                        <SearchIcon
                        className={cx("sidenav__icon")}
                        style={{ width: "27px", height: "27px", fontWeight: "900" }}
                        />
                        {open ? null : <span className={cx("span")}>Search</span>}
                    </button>
                    <button
                        onClick={() => {
                        navigate("/group", { replace: true });
                        }}
                        className={cx("sidenav__button")}
                        style={
                        open
                            ? { width: "71%", margin: "5px 10px 5px 10px" }
                            : locate === "/group" || locate.startsWith("/g/")
                            ? { background: "rgba(255, 255, 255, 0.128)" }
                            : null
                        }
                    >
                        {locate === "/group" ? (
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

                        {open ? null : <span className={cx("span")}>Groups</span>}
                    </button>
                    {/* <button
                        className={cx("sidenav__button")}
                        style={open ? { width: "71%", margin: "5px 10px 5px 10px" } : null}
                    >
                        <MovieOutlinedIcon
                        className={cx("sidenav__icon")}
                        style={{ width: "27px", height: "27px" }}
                        />
                        {open ? null : <span>Reels</span>}
                    </button> */}
                    <button
                        className={cx("sidenav__button")}
                        style={
                        open
                            ? { width: "71%", margin: "5px 10px 5px 10px" }
                            : locate === "/chat"
                            ? { background: "rgba(255, 255, 255, 0.128)" }
                            : null
                        }
                    >
                        {locate === "/chat" ? (
                        <ChatIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        ) : (
                        <ChatOutlinedIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        )}
                        {open ? null : <span className={cx("span")}>Messages</span>}
                    </button>
                    <button
                        className={cx("sidenav__button")}
                        style={Object.assign(
                        {},
                        open ? { width: "71%", margin: "5px 10px 5px 10px" } : {},
                        open === "Notification" ? { background: "rgba(255, 255, 255, 0.128)" } : {}
                        )}
                    >
                        {open === "Notification" ? (
                        <FavoriteIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        ) : (
                        <FavoriteBorderIcon
                            className={cx("sidenav__icon")}
                            style={{ width: "27px", height: "27px" }}
                        />
                        )}
                        {open ? null : <span className={cx("span")}>Notifications</span>}
                    </button>
                    <button
                        className={cx("sidenav__button")}
                        style={open ? { width: "71%", margin: "5px 10px 5px 10px" } : null}
                    >
                        <AddBoxOutlinedIcon
                        className={cx("sidenav__icon")}
                        style={{ width: "27px", height: "27px" }}
                        />
                        {open ? null : <span className={cx("span")}>Create</span>}
                    </button>
                </div>
            </div>
        </div>
    )
    
}

export default Sidenav;