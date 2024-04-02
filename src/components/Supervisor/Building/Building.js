import classNames from 'classnames/bind';
import styles from "./Building.module.scss";
import ApartmentIcon from '@mui/icons-material/Apartment';
const cx = classNames.bind(styles);
function Building() {
    return(
        <div className={cx("building")}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
                <ApartmentIcon style={{width: "50px", height: "50px", color: "white"}}/>
            </div>
            <span style={{
                color: "white",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif'}}>
                    Khu A</span>
        </div>
    )
}
export default Building;