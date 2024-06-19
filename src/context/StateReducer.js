const StateReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        isFetching: false,
        error: true,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    case "SET_USER_FIELDS":
      // action.payload có thể là { user_info: { bio: "hello from website", gender: "male", ... }, user_setting: { setting1: "value1", ... }, full_name: "new name", ... }
      const updatedUser = { ...state.user };

      for (const key in action.payload) {
        const fieldValue = action.payload[key];

        if (typeof fieldValue === "object" && fieldValue !== null) {
          // Nếu là object, duyệt qua tất cả các keys bên trong và áp dụng chúng
          updatedUser[key] = {
            ...updatedUser[key],
            ...fieldValue,
          };
        } else {
          // Nếu không phải object, áp dụng trực tiếp vào updatedUser
          updatedUser[key] = fieldValue;
        }
      }

      return {
        ...state,
        user: updatedUser,
      };

    case "SET_AUTH":
      return {
        ...state,
        auth: action.payload,
      };
    case "SET_PERSIST":
      return {
        ...state,
        persist: action.payload,
      };
    case "SET_REGIS_INFO":
      return {
        ...state,
        regisInfo: action.payload,
      };
    case "SET_OTP_TOKEN":
      return {
        ...state,
        otpToken: action.payload,
      };
    case "SET_FACE_MATCHER":
      return {
        ...state,
        faceMatcher: action.payload,
      };
    default:
      return state;
  }
};


const convertReactsArrayToMap = (postsArray) => {
  return postsArray.map((post) => {
    // Chuyển đổi reacts array thành Map
    const reactsMap = new Map(post.reacts.map((react) => [react.user, react]));

    // Trả về post với reacts là một Map
    return { ...post, reacts: reactsMap };
  });
};

export default StateReducer;
