export const LoginStart = (userCredentials) => ({
  type: "LOGIN_START",
});

export const LoginSuccess = (user) => ({
  type: "LOGIN_SUCCESS",
  payload: user,
});

export const LoginFailure = () => ({
  type: "LOGIN_FAILURE",
});

export const Follow = (userId) => ({
  type: "FOLLOW",
  payload: userId,
});

export const Unfollow = (userId) => ({
  type: "UNFOLLOW",
  payload: userId,
});

export const currentChat = (conversation) => ({
  type: "CURRENT_CHAT",
  payload: conversation,
});
export const setMessages = (messages) => ({
  type: "SET_MESSAGES",
  payload: messages,
});
export const setSocket = (socket) => ({
  type: "SET_SOCKET",
  payload: socket,
});
export const sendMessage = (newMessage) => ({
  type: "ADD_MESSAGE",
  payload: newMessage,
});
export const setUser = (user) => ({
  type: "SET_USER",
  payload: user,
});
export const setAuth = (accessToken) => ({
  type: "SET_AUTH",
  payload: accessToken,
});
export const setPersist = (persist = true) => ({
  type: "SET_PERSIST",
  payload: persist,
});
export const setRegisInfo = (regisInfo) => ({
  type: "SET_REGIS_INFO",
  payload: regisInfo,
});
export const setOtpToken = (otpToken) => ({
  type: "SET_OTP_TOKEN",
  payload: otpToken,
});
export const setPosts = (posts) => ({
  type: "SET_POSTS",
  payload: posts,
});
export const addCreatedPost = (post) => ({
  type: "ADD_CREATED_POST",
  payload: post,
});
export const addPosts = (posts) => ({
  type: "ADD_POSTS",
  payload: posts,
});
export const updatePostReact = (react) => ({
  type: "UPDATE_POST_REACT",
  payload: react,
});
export const updateReactsCount = (react) => ({
  type: "UPDATE_REACTS_COUNT",
  payload: react,
});
export const updateUserProfileFields = (updateFields) => ({
  type: "SET_USER_FIELDS",
  payload: updateFields,
});
export const setSavedPost = (postToSave) => ({
  type: "SET_SAVED_POST",
  payload: postToSave,
});
export const deleteContextPost = (postId) => ({
  type: "DELETE_POST",
  payload: postId,
});
