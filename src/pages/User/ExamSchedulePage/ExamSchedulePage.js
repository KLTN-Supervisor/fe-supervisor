import React, {  useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import classNames from "classnames/bind";
import styles from "./ExamSchedulePage.module.scss";
import Sidenav from "../../../components/Sidenav";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);
function ExamSchedulePage() {
    return (
        <div className={cx("schedulePage")}>
            <div className={cx("schedulePage__navWraper")}>
                <Sidenav />
            </div>
            <div className={cx("schedulePage__content")}>
                <h1>Tra cứu lịch thi</h1>
                <div className={cx("page_content")}>
                    <div className={cx("page_content__header")}>
                        <input
                            type="text"
                            placeholder="Search"
                        />
                        <button
                            className={cx("search__button")}
                            style={{ display:"flex", width: "auto", padding: 10, borderRadius: 20,marginLeft: 30, }}
                        >
                            <SearchIcon
                                className={cx("search__icon")}
                                style={{ width: "24px", height: "24px", fontWeight: "900" }}
                            />
                            <span className={cx("span")}>Search</span>
                        </button>
                    </div>
                    <div className={cx("page_content__body")}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Column 1</th>
                                    <th>Column 2</th>
                                    <th>Column 3</th>
                                    <th>Column 4</th>
                                    <th>Column 5</th>
                                    <th>Column 6</th>
                                    <th>Column 7</th>
                                    <th>Column 8</th>
                                    <th>Column 9</th>
                                    <th>Column 10</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Row 1, Column 1</td>
                                    <td>Row 1, Column 2</td>
                                    <td>Row 1, Column 3</td>
                                    <td>Row 1, Column 4</td>
                                    <td>Row 1, Column 5</td>
                                    <td>Row 1, Column 6</td>
                                    <td>Row 1, Column 7</td>
                                    <td>Row 1, Column 8</td>
                                    <td>Row 1, Column 9</td>
                                    <td>Row 1, Column 10</td>
                                </tr>
                                <tr>
                                    <td>Row 2, Column 1</td>
                                    <td>Row 2, Column 2</td>
                                    <td>Row 2, Column 3</td>
                                    <td>Row 2, Column 4</td>
                                    <td>Row 2, Column 5</td>
                                    <td>Row 2, Column 6</td>
                                    <td>Row 2, Column 7</td>
                                    <td>Row 2, Column 8</td>
                                    <td>Row 2, Column 9</td>
                                    <td>Row 2, Column 10</td>
                                </tr>
                                <tr>
                                    <td>Row 3, Column 1</td>
                                    <td>Row 3, Column 2</td>
                                    <td>Row 3, Column 3</td>
                                    <td>Row 3, Column 4</td>
                                    <td>Row 3, Column 5</td>
                                    <td>Row 3, Column 6</td>
                                    <td>Row 3, Column 7</td>
                                    <td>Row 3, Column 8</td>
                                    <td>Row 3, Column 9</td>
                                    <td>Row 3, Column 10</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamSchedulePage;