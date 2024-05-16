export const getStudentsImageSource = (source) => {
  if (source.startsWith("https:")) {
    return source;
  } else {
    return process.env.REACT_APP_SERVER_BASE_URL + source;
  }
};
