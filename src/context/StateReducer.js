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
    case "FOLLOW":
      return {
        ...state,
        user: {
          ...state.user,
          followings: [...state.user.followings, action.payload],
        },
      };
    case "UNFOLLOW":
      return {
        ...state,
        user: {
          ...state.user,
          followings: state.user.followings.filter(
            (following) => following !== action.payload
          ),
        },
      };
    case "CURRENT_CHAT":
      return {
        ...state,
        currentChat: action.payload,
        isLoadingMsg: true,
      };

    case "SET_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    case "SET_CONVERSATIONS":
      return {
        ...state,
        conversations: action.payload,
      };
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    case "FIRST_CONVERSATION":
      const updatedConversations = state.conversations.filter(
        (conversation) => conversation?._id !== action.payload?._id
      );
      return {
        ...state,
        conversations: [action.payload, ...updatedConversations],
      };
    case "DELETE_CONVERSATION":
      const deletedConversations = state.conversations.filter(
        (conversation) => conversation?._id !== action.payload?._id
      );
      return {
        ...state,
        conversations: [...deletedConversations],
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      };
    case "IS_LOADING_MESSAGES":
      return {
        ...state,
        isLoadingMsg: action.payload,
      };
    case "ADD_MESSAGE":
      // Kiểm tra xem tin nhắn đã tồn tại trong danh sách hay chưa
      const isDuplicate = state.messages.some(
        (message) => message._id === action.payload._id
      );

      if (!isDuplicate) {
        return {
          ...state,
          messages: [...state.messages, action.payload],
        };
      }

      return state;
    case "LOAD_MORE_MESSAGES":
      return {
        ...state,
        messages: [...action.payload, ...state.messages],
      };
    case "UPDATE_MESSAGE_REMOVED":
      return {
        ...state,
        messageRemoves: [...state.messageRemoves, action.payload],
      };
    case "SET_POSTS":
      if (!action.payload || action.payload.length === 0) {
        // Nếu action.payload là null hoặc rỗng, trả về state với posts là Map trống
        return {
          ...state,
          posts: new Map(),
        };
      }

      return {
        ...state,
        posts: new Map(action.payload.map((post) => [post._id, post])),
      };
    case "ADD_CREATED_POST":
      return {
        ...state,
        posts: new Map([
          [action.payload._id, action.payload],
          ...state.posts.entries(),
        ]),
      };
    case "DELETE_POST":
      const postIdToDelete = action.payload;
      const updatedPosts = new Map(state.posts);
      updatedPosts.delete(postIdToDelete);

      return {
        ...state,
        posts: updatedPosts,
      };

    case "ADD_POSTS":
      return {
        ...state,
        posts: new Map([
          ...state.posts.entries(),
          ...action.payload.map((post) => [post._id, post]),
        ]),
      };
    case "UPDATE_REACTS_COUNT": {
      const { postId, reactsCount } = action.payload;

      // Kiểm tra xem post có tồn tại trong state hay không
      if (state.posts.has(postId)) {
        const isLiked =
          reactsCount < state.posts.get(postId).reacts_count
            ? false
            : reactsCount > state.posts.get(postId).reacts_count
            ? true
            : state.posts.get(postId).is_user_liked;
        // Tạo bản sao của post và cập nhật giá trị reactsCount
        const updatedPost = {
          ...state.posts.get(postId),
          reacts_count: reactsCount,
          is_user_liked: isLiked,
        };

        // Cập nhật state.posts với post đã được cập nhật
        return {
          ...state,
          posts: new Map([...state.posts, [postId, updatedPost]]),
        };
      }

      return state;
    }
    case "SET_SAVED_POST": {
      const { postId, isSaved } = action.payload;
      // Kiểm tra xem post có tồn tại trong state hay không
      if (state.posts.has(postId)) {
        const updatedPost = {
          ...state.posts.get(postId),
          is_saved: isSaved,
        };

        // Cập nhật state.posts với post đã được cập nhật
        return {
          ...state,
          posts: new Map([...state.posts, [postId, updatedPost]]),
        };
      }

      return state;
    }
    // case "UPDATE_POST_REACT":
    //   const { postId, userId, emoji } = action.payload;

    //   let reactPost;

    //   // Kiểm tra xem post có tồn tại trong danh sách không
    //   if (state.posts.has(postId)) {
    //     // Lấy ra post từ Map
    //     reactPost = state.posts.get(postId);

    //     // Kiểm tra xem người dùng đã thích bài viết chưa
    //     const existingReact = reactPost.reacts.get(userId);

    //     console.log("post cần like", reactPost);

    //     if (existingReact) {
    //       // Nếu đã thích, kiểm tra emoji
    //       if (existingReact.emoji === emoji) {
    //         console.log("hủy like");
    //         // Nếu emoji giống nhau, hủy tương tác
    //         reactPost.reacts.delete(userId);
    //       } else {
    //         console.log("thay đổi react");
    //         // Nếu emoji khác nhau, cập nhật emoji
    //         reactPost.reacts.emoji = emoji;
    //       }
    //     } else {
    //       console.log("like bài");
    //       // Nếu chưa tương tác, thêm một react mới
    //       reactPost.reacts.set(userId, { user: userId, emoji: emoji });
    //     }
    //   }

    //   return {
    //     ...state,
    //     posts: new Map([...state.posts.entries(), [reactPost._id, reactPost]]),
    //   };

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
    case "SET_VIDEO_CALL":
      return {
        ...state,
        videoCall: action.payload,
      };
    case "SET_VOICE_CALL":
      return {
        ...state,
        voiceCall: action.payload,
      };
    case "SET_INCOMING_VOICE_CALL":
      return {
        ...state,
        incomingVoiceCall: action.payload,
      };
    case "SET_INCOMING_VIDEO_CALL":
      return {
        ...state,
        incomingVideoCall: action.payload,
      };
    case "END_CALL":
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVideoCall: undefined,
        incomingVoiceCall: undefined,
      };
    default:
      return state;
  }
};

// Hàm helper để lọc các bài viết mới
const filterUniqueNewPosts = (statePosts, newPosts) => {
  return newPosts.filter(
    (newPost) => !statePosts.some((prevPost) => prevPost?._id === newPost._id)
  );
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
