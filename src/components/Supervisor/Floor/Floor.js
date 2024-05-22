import classNames from 'classnames/bind';
import {useState} from 'react'
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
function Floor({room, handleRoomClick, time}) {
    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

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
                    <Room key={r._id} room={r} 
                        handleRoomClick={() => {handleRoomClick(r._id, time, r.room_name)}} />
                ))}
                </div>
            </Collapse>
        </>
    )
}
export default Floor;