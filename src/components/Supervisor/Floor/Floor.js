import classNames from 'classnames/bind';
import {useState, useEffect} from 'react'
import styles from "./Floor.module.scss";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Room from "../Room"
const cx = classNames.bind(styles);
function Floor({room, handleRoomClick, time, roomIdClicked}) {
    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(!open);
    };
    useEffect(()=>{
        console.log(roomIdClicked);
        setOpen(!open);
    },[roomIdClicked])
    


    return (
        <>
            <ListItemButton onClick={handleClick}>
                <ListItemIcon>
                <MeetingRoomIcon />
                </ListItemIcon>
                <ListItemText primary={`Tầng ${room[0]?.floor}`} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <div className={cx("floor")}>
                {room.map((r) => (
                    <Room style={{backgroundColor: roomIdClicked === r._id ? "#11d2ef4a" : "fff"}} 
                        key={r._id} room={r} 
                        roomIdClicked={roomIdClicked}
                        handleRoomClick={() => {handleRoomClick(r._id, time, r.room_name)}} />
                ))}
                </div>
            </Collapse>
        </>
    )
}
export default Floor;