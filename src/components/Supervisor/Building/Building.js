import classNames from "classnames/bind";
import styles from "./Building.module.scss";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(styles);
function Building({ building, date, setBuildingClick, home }) {
  const navigate = useNavigate();
  const handleNavigation = () => {
    if (home) {
      setBuildingClick(building);
    } else {
      navigate("schedule", { state: { building, date } });
    }
  };
  return (
    <div className={cx("building")} onClick={handleNavigation}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ApartmentIcon
          style={{ width: "50px", height: "50px", color: "white" }}
        />
      </div>
      <span
        style={{
          color: "white",
          fontSize: "16px",
          fontWeight: 500,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif',
        }}
      >
        {building.building_name}
      </span>
    </div>
  );
}
export default Building;
