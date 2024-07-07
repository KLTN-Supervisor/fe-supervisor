import classNames from 'classnames/bind';
import styles from "./Room.module.scss";
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import { useEffect } from 'react';
const cx = classNames.bind(styles);
function Room({room, handleRoomClick, roomIdClicked}) {
    useEffect(()=>{
        console.log(roomIdClicked);
        console.log(roomIdClicked === room._id);
    },[roomIdClicked])

    return(
        <div className={cx("room")} onClick={handleRoomClick} style={{backgroundColor: roomIdClicked === room._id ? "#11d2ef4a" : "fff"}}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginRight: "10px"}}>
                <MeetingRoomOutlinedIcon style={{color: "rgb(0 36 147 / 83%)"}}/>
            </div>
            <span style={{
                color: "rgb(0 36 147 / 83%)",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif'}}>
                    {room.room_name}</span>
        </div>
    )
}
export default Room;