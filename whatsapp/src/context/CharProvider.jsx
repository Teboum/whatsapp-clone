import React, {
  useRef,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || ""
  );
  const [token, setToken] = useState(Cookies.get("token") || false);
  const [selectedChat, setSelectedChat] = useState(
    sessionStorage.getItem("selectedChat") || false
  );
  const [image, setImage] = useState(sessionStorage.getItem("image"));
  const [search, setSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [remoteId, setRemoteId] = useState("");

  const [friendList, setFriendList] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        selectedChat,
        setSelectedChat,
        image,
        setImage,
        search,
        setSearch,
        notifications,
        setNotifications,
        remoteId,
        setRemoteId,
        friendList,
        setFriendList,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
