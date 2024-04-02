import classNames from 'classnames/bind';
import {useState} from 'react'
import styles from "./Floor.module.scss";
import ApartmentIcon from '@mui/icons-material/Apartment';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Room from "../Room"
const cx = classNames.bind(styles);
function Floor() {
    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(!open);
    };
    return (
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                Danh sách tầng
                </ListSubheader>
            }
        >
            <ListItemButton onClick={handleClick}>
                <ListItemIcon>
                <MeetingRoomIcon />
                </ListItemIcon>
                <ListItemText primary="Tầng 1" />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <div className={cx("floor")}>
                    <Room/>
                    <Room/>
                    <Room/>
                    <Room/>
                    <Room/>
                    <Room/>
                    <Room/>
                </div>
            </Collapse>
        </List>
    )
}
export default Floor;