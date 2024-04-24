import classNames from "classnames/bind";
import React from "react";
import styles from "./LoadingCard.module.scss";
const cx = classNames.bind(styles);
function LoadingCard() {
  
  return (
    <>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
      <div className={cx("student")} ></div>
    </>
  );
}
export default LoadingCard;
