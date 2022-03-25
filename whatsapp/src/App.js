import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import Home from "./Home";
import { ChatState } from "./context/CharProvider";
function App() {
  const [image, setImage] = useState(sessionStorage.getItem("image") || null);
  const { user, setUser, setToken, token } = ChatState();

  // useEffect(() => {
  //   // var pusher = new Pusher("b19265744ce797e7dc48", {
  //   //   cluster: "eu",
  //   // });

  //   // var channel = pusher.subscribe("messages");
  //   // channel.bind("inserted",  async function (newMessage) {
  //   //   JSON.stringify(newMessage);
  //   //   setMessages([...messages,newMessage]);
  //   // });
  //   console.log(messages);

  //   })
  //   return () => {
  //     // channel.unbind_all();
  //     // channel.unsubscribe();
  //   };
  // }, []);

  return (
    <div className="app">
      {user ? (
        <Home />
      ) : (
        <Login
          token={token}
          setToken={setToken}
          setUser={setUser}
          setImage={setImage}
        />
      )}
    </div>
  );
}

export default App;
