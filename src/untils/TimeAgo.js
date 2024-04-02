import moment from "moment";
import Moment from "react-moment";

const TimeAgo = ({ type = "default", created_at }) => {
  if (type === "default") {
    return <Moment fromNow>{created_at}</Moment>;
  }

  if (type === "short") {
    const now = moment();
    const postTime = moment(created_at);

    const diffInMilliseconds = now.diff(postTime);
    const diffInSeconds = Math.round(diffInMilliseconds / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);

    // Xác định định dạng thời gian
    if (diffInMinutes < 1) {
      return `${diffInSeconds}s`;
    } else if (diffInHours < 1) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 7 * 24) {
      return `${Math.round(diffInHours / 24)}d`;
    } else {
      return moment(created_at).format("DD MM YYYY HH:mm");
    }
  }

  if (type === "admin-short") {
    const now = moment();
    const postTime = moment(created_at);

    const diffInMilliseconds = now.diff(postTime);
    const diffInSeconds = Math.round(diffInMilliseconds / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);

    // Xác định định dạng thời gian
    if (diffInMinutes < 1) {
      return `${diffInSeconds}s`;
    } else if (diffInHours < 1) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 7 * 24) {
      return `${Math.round(diffInHours / 24)}d`;
    } else {
      return `${Math.round(diffInHours / (24 * 7))}w`;
    }
  }

  return null;
};

export default TimeAgo;
