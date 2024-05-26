export const getStudentsImageSource = (source) => {
  if (source === "" || typeof source === "undefined") {
    return "/no-avatar.png";
  }
  if (source.startsWith("https:") || source.startsWith("data:image")) {
    return source;
  } else {
    return process.env.REACT_APP_SERVER_BASE_URL + source;
  }
};
