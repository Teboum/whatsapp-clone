import React from "react";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

function Home() {
  return (
    <div className="app__body">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default Home;
